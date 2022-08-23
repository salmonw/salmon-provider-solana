import {
  LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey, Connection, Keypair,
} from '@solana/web3.js';
import { transfer } from '@solana/spl-token';
import { IToken } from '@salmonw/provider-base';
import {
  getAssociatedTokenAddress,
  getTokenAccount,
  getOrCreateTokenAccount,
  applyDecimals,
} from './solana-token-service';
import { getTokenByAddress } from './solana-token-list-service';

const sendAndConfirmTransaction = async (
  connection: Connection,
  transaction: Transaction,
  keyPair: Keypair,
) => {
  const txid = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  const response = await connection.confirmTransaction(txid);
  return { txid, response };
};

const execute = async (connection: Connection, transaction: Transaction, keyPair: Keypair) => {
  const simulation = await connection.simulateTransaction(transaction, [keyPair]);
  if (simulation) {
    return sendAndConfirmTransaction(connection, transaction, keyPair);
  }
  throw Error('simulation failed');
};

/**
 * Sends SOL between accounts
 * @param connection rpc connection
 * @param fromKeyPair sender account key pair
 * @param toPublicKey receiver account public key
 * @param token token to send address
 * @param amount amount in SOL
 * @returns transaction result
 */
const transferSpl = async (
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
  const toTokenAddress: PublicKey = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    toPublicKey,
  );
  const token:IToken = await getTokenByAddress(tokenAddress);
  const transferAmount = token.decimals ? applyDecimals(amount, token.decimals) : amount;

  const destTokenAccount = await getTokenAccount(connection, toPublicKey, tokenAddress);
  if (!destTokenAccount) {
    await getOrCreateTokenAccount(connection, fromKeyPair, tokenAddress, toPublicKey);
  }

  const result = await transfer(
    connection,
    fromKeyPair,
    fromTokenAddress,
    toTokenAddress,
    fromKeyPair.publicKey,
    transferAmount,
    [fromKeyPair],
  );
  return result;
};

/**
 * Sends SOL between accounts
 *
 * @param fromKeyPair sender account key pair
 * @param toPublicKey receiver account public key
 * @param amount amount in SOL
 * @param opts simulate: simulates the transaction
 * @returns transaction result
 */
const transferSol = async (
  connection: Connection,
  fromKeyPair: Keypair,
  toPublicKey: PublicKey,
  amount: number,
) => {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeyPair.publicKey,
      toPubkey: toPublicKey,
      lamports: LAMPORTS_PER_SOL * amount,
    }),
  );
  const result = await execute(connection, transaction, fromKeyPair);
  return result ? result.txid : undefined;
};

const airdrop = async (connection: Connection, publicKey: PublicKey, amount: number) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  return connection.confirmTransaction(airdropSignature);
};

export {
  transferSol,
  transferSpl,
  airdrop,
};
