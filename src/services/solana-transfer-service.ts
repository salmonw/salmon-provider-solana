import {
  LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, Connection, Keypair,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token';

import {
  getAssociatedTokenAddress,
  getTokenAccount,
  getOrCreateTokenAccount,
  applyDecimals,
} from './solana-token-service';
import { getTokenByAddress } from './solana-token-list-service';
import { SOL_ADDRESS } from '../constants/solana-constants';

const createTransaction = async (
  connection,
  fromKeyPair,
  toPublicKey,
  token,
  amount,
  opts = {},
) => {
  const { simulate } = opts;
  let transaction = null;
  if (token == SOL_ADDRESS) {
    transaction = await transactionSol(connection, fromKeyPair, toPublicKey, amount);
  } else {
    transaction = await transactionSpl(connection, fromKeyPair, toPublicKey, token, amount, opts);
  }
  const result = await execute(connection, transaction, fromKeyPair, simulate);
  return result;
};

const transactionSol = async (connection, fromKeyPair, toPublicKey, amount, opts = {}) => {
  const { simulate } = opts;
  const recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  const transaction = new Transaction({ feePayer: fromKeyPair.publicKey, recentBlockhash }).add(
    SystemProgram.transfer({
      fromPubkey: fromKeyPair.publicKey,
      toPubkey: toPublicKey,
      lamports: LAMPORTS_PER_SOL * amount,
    }),
  );
  return transaction;
};

const transactionSpl = async (
  connection,
  fromKeyPair,
  toPublicKey,
  tokenAddress,
  amount,
  opts = {},
) => {
  const { simulate } = opts;
  const fromTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    fromKeyPair.publicKey,
  );
  const toTokenAddress = await getAssociatedTokenAddress(new PublicKey(tokenAddress), toPublicKey);
  const token = await getTokenByAddress(tokenAddress);
  const transferAmount = token.decimals ? applyDecimals(amount, token.decimals) : amount;
  const destTokenAccount = await getTokenAccount(connection, toPublicKey, tokenAddress);
  if (!destTokenAccount) {
    console.log('creating token account');
    const ta = await getOrCreateTokenAccount(connection, fromKeyPair, tokenAddress, toPublicKey);
    console.log(`Token account: ${ta}`);
  }
  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAddress,
      toTokenAddress,
      fromKeyPair.publicKey,
      transferAmount,
      [],
      TOKEN_PROGRAM_ID,
    ),
  );
  const latestBlockHash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = latestBlockHash.blockhash;
  transaction.feePayer = fromKeyPair.publicKey;
  return transaction;
};

const execute = async (connection, transaction, keyPair, simulate) => {
  let result = null;
  if (simulate) {
    result = await connection.simulateTransaction(transaction, [keyPair]);
  } else {
    result = await sendTransaction(connection, transaction, keyPair);
  }
  return result;
};

const sendTransaction = async (connection, transaction, keyPair) => {
  const txid = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  return txid;
};

const estimateFee = async (connection, fromKeyPair, toPublicKey, token, amount) => {
  let transaction;
  if (token == SOL_ADDRESS) {
    transaction = await transactionSol(connection, fromKeyPair, toPublicKey, amount);
  } else {
    transaction = await transactionSpl(connection, fromKeyPair, toPublicKey, token, amount);
  }
  return await transaction.getEstimatedFee(connection);
};

const confirmTransaction = async (connection, txId) => {
  return await connection.confirmTransaction(txId);
};

const airdrop = async (connection: Connection, publicKey: PublicKey, amount: number) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  return connection.confirmTransaction(airdropSignature);
};

module.exports = {
  estimateFee,
  createTransaction,
  confirmTransaction,
  airdrop,
};
