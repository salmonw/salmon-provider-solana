import { PublicKey } from '@solana/web3.js';
import * as tokenListService from './solana-token-list-service';
import * as nftService from './solana-nft-service';

const getTokenInfo = async (tokenAddress, connection) => {
  const tokenAccount =
    tokenAddress && (await connection.getParsedAccountInfo(new PublicKey(tokenAddress)));

  if (tokenAccount) {
    return await tokenListService.getTokenByAddress(tokenAccount.value?.data.parsed.info.mint);
  }
};

const decorateRecentTransactions = async (transaction, connection, publicKey) => {
  const txMeta = transaction.data.meta;
  const txMsg = transaction.data.transaction.message;

  const lamportsAmount =
    txMsg.instructions[1]?.parsed?.info?.lamports ||
    txMsg.instructions[0]?.parsed?.info?.lamports ||
    txMeta.innerInstructions[0]?.instructions[0]?.parsed?.info?.lamports;

  const nftAddress = txMeta.innerInstructions[0]?.instructions?.filter(
    (ins) => ins.parsed?.info?.owner === publicKey.toBase58() && ins.parsed?.info?.mint
  )[0]?.parsed?.info?.mint;

  const nftInfo = nftAddress && (await nftService.getNftByAddress(nftAddress));

  const swapIn = txMeta.innerInstructions
    ?.pop()
    ?.instructions?.filter((ins) => ins.parsed)
    .pop()?.parsed?.info;

  const swapOut = txMeta.innerInstructions[
    txMeta.innerInstructions.length - 1
  ]?.instructions?.filter((ins) => ins.parsed)[0].parsed?.info;

  const tokenInfoIn = await getTokenInfo(swapIn?.destination, connection);
  const tokenInfoOut = await getTokenInfo(swapOut?.destination, connection);

  const source =
    txMsg.instructions[0]?.parsed?.info?.source || txMsg.instructions[1]?.parsed?.info?.source;
  const destination =
    txMsg.instructions[0]?.parsed?.info?.destination ||
    txMsg.instructions[1]?.parsed?.info?.destination ||
    txMsg.instructions[2]?.parsed?.info?.destination;

  let isSwap = false;
  txMeta.logMessages?.map((msg, i) => {
    if (JSON.stringify(msg).includes('SetTokenLedger')) {
      isSwap = true;
    }
    if (i === 0 && JSON.stringify(msg).includes('Program JUP2')) {
      isSwap = true;
    }
  });

  const type =
    tokenInfoOut?.length || tokenInfoIn?.length || isSwap
      ? 'swap'
      : txMsg.instructions[0]?.parsed?.type ||
        txMsg.instructions[1]?.parsed?.type ||
        txMeta.innerInstructions[0]?.instructions[0]?.parsed?.type ||
        'transfer';
  const transferType =
    (type === ('transfer' || 'createAccount' || 'createAccount') &&
      publicKey.toBase58() === source) ||
    !source
      ? 'sent'
      : 'received';
  const error = Boolean(transaction.err);

  return {
    timestamp: transaction.blockTime,
    fee: txMeta.fee,
    signature: transaction.signature,
    type: type,
    transferType: transferType,
    ...(nftInfo?.collection
      ? { nftAmount: nftInfo }
      : lamportsAmount && {
          amount: lamportsAmount / 1000000000,
        }),
    ...(nftInfo?.collection && { nftAmount: nftInfo }),
    ...(source?.length && { source: source }),
    ...(destination?.length && { destination: destination }),
    ...(swapIn && { swapAmountIn: swapIn.amount }),
    ...(swapOut && { swapAmountOut: swapOut.amount }),
    ...(tokenInfoIn?.length && { tokenNameIn: tokenInfoIn[0].symbol }),
    ...(tokenInfoOut?.length && { tokenNameOut: tokenInfoOut[0].symbol }),
    ...(tokenInfoIn?.length && { tokenLogoIn: tokenInfoIn[0].logo }),
    ...(tokenInfoOut?.length && { tokenLogoOut: tokenInfoOut[0].logo }),
    ...(error && { error: error }),
  };
};

export {
  decorateRecentTransactions,
};
