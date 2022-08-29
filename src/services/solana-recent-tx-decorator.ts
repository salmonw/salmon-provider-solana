import {
  Connection, PublicKey, ParsedAccountData, AccountInfo, RpcResponseAndContext,
} from '@solana/web3.js';
import { IToken } from '@salmonw/provider-base';
import * as tokenListService from './solana-token-list-service';
import * as nftService from './solana-nft-service';
import {
  ISignature, ITokenAccount, IInsParsed, IInsParsedInfo,
} from '../types/transfer';

const getTokenInfo = async (tokenAddress: string, connection: Connection) => {
  const tokenAccount: RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData>> = tokenAddress
    && (await connection.getParsedAccountInfo(new PublicKey(tokenAddress)));
  const tokenData: Buffer | ParsedAccountData = tokenAccount && tokenAccount.value.data;
  const tokenParsed: IInsParsed = tokenData && tokenData.parsed;
  const tokenParsedInfo: IInsParsedInfo = tokenParsed && tokenParsed.info;

  if (tokenParsedInfo) {
    return tokenListService.getTokenByAddress(tokenParsedInfo.mint);
  }
  return null;
};

const decorateRecentTransactions = async (
  transaction: ISignature,
  connection: Connection,
  publicKey: PublicKey,
) => {
  console.log('t', JSON.stringify(transaction));
  const txMeta = transaction.data.meta;
  const txMsg = transaction.data.transaction.message;

  const lamportsAmount = txMsg.instructions[1]?.parsed?.info?.lamports
    || txMsg.instructions[0]?.parsed?.info?.lamports
    || txMeta.innerInstructions[0].instructions[0]?.parsed?.info?.lamports;

  const nftAddress = txMeta.innerInstructions[0].instructions.filter(
    (ins) => ins.parsed?.info?.owner === publicKey.toBase58() && ins.parsed?.info?.mint,
  )[0]?.parsed?.info?.mint;

  const nftInfo = nftAddress && (await nftService.getNftByAddress(nftAddress));

  const swapIn = txMeta.innerInstructions.length && txMeta.innerInstructions
    .pop()
    .instructions.filter((ins) => ins.parsed)
    .pop().parsed?.info;

  const swapOut = txMeta.innerInstructions.length && txMeta.innerInstructions[
    txMeta.innerInstructions.length - 1
  ].instructions.filter((ins) => ins.parsed)[0].parsed?.info;

  const tokenInfoIn: IToken = await
  getTokenInfo(swapIn?.destination || swapIn?.mint, connection);
  const tokenInfoOut: IToken = await
  getTokenInfo(swapOut?.destination || swapOut?.mint, connection);

  const transferInfoIn: IToken = await tokenListService.getTokenByAddress(swapIn?.mint);
  const transferInfoOut: IToken = await tokenListService.getTokenByAddress(swapOut?.mint);

  const transferAmount = txMeta.postTokenBalances.filter((bal) => bal.owner === publicKey.toBase58())[0]?.uiTokenAmount
    ?.uiAmount
    || txMeta.preTokenBalances.filter((bal) => bal.owner === publicKey.toBase58())[0]?.uiTokenAmount
      ?.uiAmount;

  const source = txMsg.instructions[0]?.parsed?.info?.source || txMsg.instructions[1]?.parsed?.info?.source;
  const destination = txMsg.instructions.filter((ins) => ins.parsed.type === 'transfer')[0]?.parsed?.info
    ?.destination
    || txMsg.instructions[0]?.parsed?.info?.destination
    || txMsg.instructions[1]?.parsed?.info?.destination
    || txMsg.instructions[2]?.parsed?.info?.destination;

  let isSwap = false;
  txMeta.logMessages.map((msg, i) => {
    if (JSON.stringify(msg).includes('SetTokenLedger')) {
      isSwap = true;
    }
    if (i === 0 && JSON.stringify(msg).includes('Program JUP2')) {
      isSwap = true;
    }
  });

  const type = tokenInfoOut || tokenInfoIn || isSwap
    ? 'swap'
    : txMsg.instructions[0]?.parsed?.type
        || txMsg.instructions[1]?.parsed?.type
        || txMeta.innerInstructions[0].instructions[0]?.parsed?.type
        || 'transfer';
  const transferType = ((type === 'transfer'
    || type === 'createAccount'
    || type === 'createAccount'
    || type === 'create')
      && publicKey.toBase58() === source)
    || !source
    ? 'sent'
    : 'received';
  const error = Boolean(transaction.err);

  return {
    timestamp: transaction.blockTime,
    fee: txMeta.fee,
    signature: transaction.signature,
    type,
    transferType,
    ...(nftInfo && nftInfo.collection
      ? { nftAmount: nftInfo }
      : lamportsAmount && {
        amount: lamportsAmount / 1000000000,
      }),
    ...(nftInfo && nftInfo.collection && { nftAmount: nftInfo }),
    ...(source && { source }),
    ...(destination && { destination }),
    ...(transferInfoIn && { transferNameIn: transferInfoIn.symbol }),
    ...(transferInfoOut && { transferNameOut: transferInfoOut.symbol }),
    ...(transferInfoIn && { transferLogoIn: transferInfoIn.logo }),
    ...(transferInfoOut && { transferLogoOut: transferInfoOut.logo }),
    ...(transferAmount && { transferAmount }),
    ...(swapIn && { swapAmountIn: swapIn.amount }),
    ...(swapOut && { swapAmountOut: swapOut.amount }),
    ...(tokenInfoIn && { tokenNameIn: tokenInfoIn.symbol }),
    ...(tokenInfoOut && { tokenNameOut: tokenInfoOut.symbol }),
    ...(tokenInfoIn && { tokenLogoIn: tokenInfoIn.logo }),
    ...(tokenInfoOut && { tokenLogoOut: tokenInfoOut.logo }),
    ...(error && { error }),
  };
};

export {
  decorateRecentTransactions,
};
