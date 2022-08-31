import { Connection, PublicKey, ParsedTransactionMeta } from '@solana/web3.js';
import { ISignatureWithData, IMessage } from '../types/transfer';
import { mapTransaction, notEmpty } from './solana-recent-tx-mapper';

const decorateRecentTransactions = async (
  transaction: ISignatureWithData,
  connection: Connection,
  publicKey: PublicKey,
) => {
  const txMeta: ParsedTransactionMeta | null = transaction.data.meta;
  const txMsg: IMessage = transaction.data.transaction.message;

  const {
    fee,
    type,
    transferType,
    lamportsAmount,
    nftInfo,
    source,
    destination,
    transferInfoIn,
    transferInfoOut,
    transferAmount,
    swapIn,
    swapOut,
    swapInfoIn,
    swapInfoOut,
    error,
  } = await mapTransaction(transaction, txMeta, txMsg, connection, publicKey);

  return {
    timestamp: transaction.blockTime,
    signature: transaction.signature,
    fee,
    type,
    transferType,
    ...(notEmpty(nftInfo)
      ? { nftAmount: nftInfo }
      : lamportsAmount && {
        amount: Number(lamportsAmount) / 1000000000,
      }),
    ...(notEmpty(nftInfo) && { nftAmount: nftInfo }),
    ...(source && { source }),
    ...(destination && { destination }),
    ...(transferInfoIn && { transferNameIn: transferInfoIn.symbol }),
    ...(transferInfoOut && { transferNameOut: transferInfoOut.symbol }),
    ...(transferInfoIn && { transferLogoIn: transferInfoIn.logo }),
    ...(transferInfoOut && { transferLogoOut: transferInfoOut.logo }),
    ...(transferAmount && { transferAmount }),
    ...(notEmpty(swapIn) && { swapAmountIn: swapIn.amount }),
    ...(notEmpty(swapOut) && { swapAmountOut: swapOut.amount }),
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
