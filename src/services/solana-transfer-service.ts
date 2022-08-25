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

const transactionSol = async (
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  amount: number,
) => {
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
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  tokenAddress: string,
  amount: number,
) => {
  const fromTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    fromKeyPair.publicKey,
  );
  const toTokenAddress = await getAssociatedTokenAddress(new PublicKey(tokenAddress), toPublicKey);
  const token = await getTokenByAddress(tokenAddress);
  const tokenDecimals: number = token.decimals;
  const transferAmount = token.decimals ? applyDecimals(amount, tokenDecimals) : amount;
  const destTokenAccount = await getTokenAccount(connection, toPublicKey, tokenAddress);
  if (!destTokenAccount) {
    console.log('creating token account');
    const ta = await getOrCreateTokenAccount(connection, fromKeyPair, tokenAddress, toPublicKey);
    console.log(`Token account: ${JSON.stringify(ta)}`);
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

const sendTransaction = async (
  connection: Connection,
  transaction: Transaction,
  keyPair: Keypair,
) => {
  const txid = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  return txid;
};

const execute = async (
  connection: Connection,
  transaction: Transaction,
  keyPair: Keypair,
  simulate: boolean,
) => {
  return simulate
    ? connection.simulateTransaction(transaction, [keyPair])
    : sendTransaction(connection, transaction, keyPair);
};

interface OptInfo {
  simulate: boolean
}

const createTransaction = async (
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  token: string,
  amount: number,
  opts: OptInfo,
) => {
  const { simulate } = opts;
  let transaction: Transaction;
  if (token === SOL_ADDRESS) {
    transaction = await transactionSol(connection, fromKeyPair, toPublicKey, amount);
  } else {
    transaction = await transactionSpl(connection, fromKeyPair, toPublicKey, token, amount);
  }
  const result = await execute(connection, transaction, fromKeyPair, simulate);
  return result;
};

const estimateFee = async (
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  token: string,
  amount: number,
) => {
  let transaction: Transaction;
  if (token === SOL_ADDRESS) {
    transaction = await transactionSol(connection, fromKeyPair, toPublicKey, amount);
  } else {
    transaction = await transactionSpl(connection, fromKeyPair, toPublicKey, token, amount);
  }
  return transaction.getEstimatedFee(connection);
};

const confirmTransaction = async (connection: Connection, txId: string) => {
  return connection.confirmTransaction(txId);
};

const airdrop = async (connection: Connection, publicKey: PublicKey, amount: number) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  return connection.confirmTransaction(airdropSignature);
};

export {
  estimateFee,
  createTransaction,
  confirmTransaction,
  airdrop,
};
