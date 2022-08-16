import { PublicKey } from '@solana/web3.js';
import * as tokenListService from './solana-token-list-service';

const getTokenInfo = async (transaction, connection, isOut) => {
  const txMeta = transaction.data.meta;

  const tokenAddress = isOut
    ? txMeta.innerInstructions[0]?.instructions[1]?.parsed?.info?.destination
    : txMeta.innerInstructions[1]?.instructions[2]?.parsed?.info?.destination;
  const tokenAccount = tokenAddress
    && (await connection.getParsedAccountInfo(new PublicKey(tokenAddress)));

  if (tokenAccount) {
    return tokenListService.getTokenByAddress(tokenAccount.value.data.parsed.info.mint);
  }
};

const decorateRecentTransactions = async (transaction, connection, publicKey) => {
  const txMeta = transaction.data.meta;
  const txMsg = transaction.data.transaction.message;

  const tokenInfoIn = await getTokenInfo(transaction, connection, false);
  const tokenInfoOut = await getTokenInfo(transaction, connection, true);
  const swapAmountIn = txMeta.innerInstructions[1]?.instructions[2]?.parsed?.info?.amount
    || txMeta.innerInstructions[0]?.instructions[2]?.parsed?.info?.amount;
  const swapAmountOut = txMeta.innerInstructions[0]?.instructions[1]?.parsed?.info?.amount;
  const source = txMsg.instructions[1]?.parsed?.info?.source;
  const destination = txMsg.instructions[1]?.parsed?.info?.destination
    || txMsg.instructions[2]?.parsed?.info?.destination;
  const lamportsAmount = txMsg.instructions[1]?.parsed?.info?.lamports
    || txMsg.instructions[0]?.parsed?.info?.lamports
    || txMeta.innerInstructions[0]?.instructions[0]?.parsed?.info?.lamports;

  let isSwap = false;
  txMeta.logMessages?.map((msg) => {
    if (JSON.stringify(msg).includes('SetTokenLedger')) {
      isSwap = true;
    }
  });

  const type = tokenInfoOut.length || tokenInfoIn.length || isSwap
    ? 'swap'
    : txMsg.instructions[0]?.parsed?.type
        || txMsg.instructions[1]?.parsed?.type
        || txMeta.innerInstructions[0]?.instructions[0]?.parsed?.type
        || 'transfer';
  const transferType = type === ('transfer' || 'createAccount' || 'createAccount')
    && publicKey.toBase58() === destination
    ? 'received'
    : 'sent';
  const error = Boolean(transaction.err);

  return {
    timestamp: transaction.blockTime,
    fee: txMeta.fee,
    signature: transaction.signature,
    type,
    transferType,
    ...(lamportsAmount && {
      amount: lamportsAmount / 1000000000,
    }),
    ...(source?.length && { source }),
    ...(destination?.length && { destination }),
    ...(swapAmountIn?.length && { swapAmountIn }),
    ...(swapAmountOut?.length && { swapAmountOut }),
    ...(tokenInfoIn.length && { tokenNameIn: tokenInfoIn[0].symbol }),
    ...(tokenInfoOut.length && { tokenNameOut: tokenInfoOut[0].symbol }),
    ...(tokenInfoIn.length && { tokenLogoIn: tokenInfoIn[0].logo }),
    ...(tokenInfoOut.length && { tokenLogoOut: tokenInfoOut[0].logo }),
    ...(error && { error }),
  };
};

export {
  decorateRecentTransactions,
};
