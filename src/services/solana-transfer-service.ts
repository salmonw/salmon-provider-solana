import {
  LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, Connection, Keypair, SignatureResult, RpcResponseAndContext,
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createTransferInstruction } from '@solana/spl-token';
import { IToken } from '@salmonw/provider-base';
import { IOpts } from '../types/transfer';
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
  const token: IToken | undefined = await getTokenByAddress(tokenAddress);
  if (token === undefined) throw Error('unknown token');
  const { decimals } = token;
  const transferAmount = decimals ? applyDecimals(amount, decimals) : amount;
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
) :Promise<string> => {
  const txid: string = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  return txid;
};

const createTransaction = async (
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  token: string,
  amount: number,
): Promise<string> => {
  let transaction: Transaction;
  if (token === SOL_ADDRESS) {
    transaction = await transactionSol(connection, fromKeyPair, toPublicKey, amount);
  } else {
    transaction = await transactionSpl(connection, fromKeyPair, toPublicKey, token, amount);
  }
  const result = await sendTransaction(connection, transaction, fromKeyPair);
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

const confirmTransaction = async (
  connection: Connection,
  txId: string,
):Promise<SignatureResult> => {
  const { value } = await connection.confirmTransaction(txId);
  return value;
};

const airdrop = async (connection: Connection, publicKey: PublicKey, amount: number) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  const result = await connection.confirmTransaction(airdropSignature);
  return result;
};

export {
  estimateFee,
  createTransaction,
  confirmTransaction,
  airdrop,
};
