import {
  Connection,
  PublicKey,
  ParsedAccountData,
  AccountInfo,
  RpcResponseAndContext,
  ParsedTransactionMeta,
} from '@solana/web3.js';
import { IToken } from '@salmonw/provider-base';
import * as tokenListService from './solana-token-list-service';
import * as nftService from './solana-nft-service';
import {
  ISignature,
  IInsParsed,
  IInsParsedInfo,
  IMessage,
  IInstruction,
} from '../types/transfer';

const getTokenInfo = async (tokenAddress: string | null, connection: Connection) => {
  let tokenAccount: RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>;
  if (tokenAddress) {
    tokenAccount = await
    connection.getParsedAccountInfo(new PublicKey(tokenAddress));
    let tokenData: Buffer | ParsedAccountData | null;
    if (tokenAccount.value) {
      tokenData = tokenAccount.value.data;
      const tokenParsed: IInsParsed = tokenData.parsed;
      const tokenParsedInfo: IInsParsedInfo = tokenParsed.info;
      return tokenListService.getTokenByAddress(tokenParsedInfo.mint);
    }
  }
  return null;
};

const getNftInfo = async (metaFirstIns: IInstruction[] | undefined, publicKey: PublicKey) => {
  if (metaFirstIns && metaFirstIns.length) {
    const nftAddress = metaFirstIns.filter(
      (ins) => ins.parsed && ins.parsed.info.owner === publicKey.toBase58() && ins.parsed.info.mint,
    )[0]?.parsed?.info?.mint;
    if (nftAddress) {
      return nftService.getNftByAddress(nftAddress);
    }
  }
  return null;
};

const getSwapInfo = (txMeta: ParsedTransactionMeta | null, isOut: boolean) => {
  if (txMeta.innerInstructions.length) {
    if (!isOut) {
      const swapInRaw = txMeta.innerInstructions
        .pop()
        .instructions.filter((ins: IInstruction) => ins.parsed)
        .pop();
      const swapInIns: IInstruction | undefined = swapInRaw;
      return swapInIns.parsed.info;
    }
    const swapOutRaw = txMeta.innerInstructions[
      txMeta.innerInstructions.length - 1
    ].instructions.filter((ins: IInstruction) => ins.parsed);
    const swapOutIns: IInstruction = swapOutRaw[0];
    return swapOutIns.parsed.info;
  }
  return null;
};

const getSource = (txMsg: IMessage) => txMsg.instructions[0]?.parsed?.info?.source
|| txMsg.instructions[1]?.parsed?.info?.source;

const getDestination = (txMsg: IMessage) => txMsg.instructions.filter(
  (ins) => ins.parsed && ins.parsed.type === 'transfer',
)[0]?.parsed?.info?.destination
  || txMsg.instructions[0]?.parsed?.info?.destination
  || txMsg.instructions[1]?.parsed?.info?.destination
  || txMsg.instructions[2]?.parsed?.info?.destination;

const getLamportsAmount = (txMsg: IMessage, metaFirstIns: IInstruction[]
| undefined) => txMsg.instructions[1]?.parsed?.info?.lamports
|| txMsg.instructions[0]?.parsed?.info?.lamports
|| (metaFirstIns && metaFirstIns[0]?.parsed?.info?.lamports);

const getTokenAddress = (swap: IInsParsedInfo | null) => swap && (swap.destination || swap.mint);

const getType = (
  txMsg: IMessage,
  metaFirstIns: IInstruction[] | undefined,
  swapInfoOut: IToken | null | undefined,
  swapInfoIn: IToken | null | undefined,
  isSwap: boolean | void,
) => (swapInfoOut || swapInfoIn || isSwap
  ? 'swap'
  : txMsg.instructions[0]?.parsed?.type
      || txMsg.instructions[1]?.parsed?.type
      || (metaFirstIns && metaFirstIns[0]?.parsed?.type)
      || 'transfer');

const getTransferType = (
  type: string,
  publicKey: PublicKey,
  source: string | undefined,
) => (((type === 'transfer'
  || type === 'createAccount'
  || type === 'createAccount'
  || type === 'create')
    && publicKey.toBase58() === source)
  || !source
  ? 'sent'
  : 'received');

const getTransferAmount = (
  txMeta: ParsedTransactionMeta | null,
  publicKey: PublicKey,
) => txMeta.postTokenBalances.filter(
  (bal) => bal.owner === publicKey.toBase58(),
)[0]?.uiTokenAmount?.uiAmount
    || txMeta.preTokenBalances.filter((bal) => bal.owner === publicKey.toBase58())[0]?.uiTokenAmount
      ?.uiAmount;

const getSwapType = (
  txMeta: ParsedTransactionMeta | null,
) => txMeta.logMessages.forEach((msg, i) => {
  if (JSON.stringify(msg).includes('SetTokenLedger')
  || (i === 0 && JSON.stringify(msg).includes('Program JUP2'))) {
    return true;
  }
  return false;
});

const decorateRecentTransactions = async (
  transaction: ISignature,
  connection: Connection,
  publicKey: PublicKey,
) => {
  const txMeta: ParsedTransactionMeta | null = transaction.data.meta;
  const txMsg: IMessage = transaction.data.transaction.message;
  const metaFirstIns: IInstruction[] | undefined = txMeta.innerInstructions.length
    ? txMeta.innerInstructions[0].instructions : undefined;

  const source = getSource(txMsg);
  const destination = getDestination(txMsg);
  const lamportsAmount = getLamportsAmount(txMsg, metaFirstIns);
  const nftInfo = await getNftInfo(metaFirstIns, publicKey);
  const swapIn = getSwapInfo(txMeta, false);
  const swapOut = getSwapInfo(txMeta, true);
  const swapInfoIn: IToken | null | undefined = await
  getTokenInfo(getTokenAddress(swapIn), connection);
  const swapInfoOut: IToken | null | undefined = await
  getTokenInfo(getTokenAddress(swapOut), connection);
  const transferInfoIn: IToken | null | undefined = swapIn && await
  tokenListService.getTokenByAddress(swapIn.mint);
  const transferInfoOut: IToken | null | undefined = swapOut && await
  tokenListService.getTokenByAddress(swapOut.mint);
  const transferAmount = getTransferAmount(txMeta, publicKey);
  const isSwap = getSwapType(txMeta);
  const type = getType(txMsg, metaFirstIns, swapInfoOut, swapInfoIn, isSwap);
  const transferType = getTransferType(type, publicKey, source);
  const error = Boolean(transaction.err);

  return {
    timestamp: transaction.blockTime,
    fee: txMeta.fee,
    signature: transaction.signature,
    type,
    transferType,
    ...(nftInfo
      ? { nftAmount: nftInfo }
      : lamportsAmount && {
        amount: Number(lamportsAmount) / 1000000000,
      }),
    ...(nftInfo && { nftAmount: nftInfo }),
    ...(source && { source }),
    ...(destination && { destination }),
    ...(transferInfoIn && { transferNameIn: transferInfoIn.symbol }),
    ...(transferInfoOut && { transferNameOut: transferInfoOut.symbol }),
    ...(transferInfoIn && { transferLogoIn: transferInfoIn.logo }),
    ...(transferInfoOut && { transferLogoOut: transferInfoOut.logo }),
    ...(transferAmount && { transferAmount }),
    ...(swapIn && { swapAmountIn: swapIn.amount }),
    ...(swapOut && { swapAmountOut: swapOut.amount }),
    ...(swapInfoIn && { swapNameIn: swapInfoIn.symbol }),
    ...(swapInfoOut && { swapNameOut: swapInfoOut.symbol }),
    ...(swapInfoIn && { swapLogoIn: swapInfoIn.logo }),
    ...(swapInfoOut && { swapLogoOut: swapInfoOut.logo }),
    ...(error && { error }),
  };
};

export {
  decorateRecentTransactions,
};
