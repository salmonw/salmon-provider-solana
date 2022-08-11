import {
  LAMPORTS_PER_SOL, Transaction, SystemProgram, PublicKey,
} from '@solana/web3.js';
import { transfer } from '@solana/spl-token';
import {
  getAssociatedTokenAddress,
  getTokenAccount,
  getOrCreateTokenAccount,
  applyDecimals,
} from './solana-token-service';
import { getTokenByAddress } from './solana-token-list-service';

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
  connection,
  fromKeyPair,
  toPublicKey,
  tokenAddress,
  amount,
) => {
  const fromTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    fromKeyPair.publicKey,
  );
  const toTokenAddress = await getAssociatedTokenAddress(new PublicKey(tokenAddress), toPublicKey);
  const token:any = await getTokenByAddress(tokenAddress);
  const transferAmount = token.decimals ? applyDecimals(amount, token.decimals) : amount;

  const destTokenAccount = await getTokenAccount(connection, toPublicKey, tokenAddress);
  if (!destTokenAccount) {
    console.log('creating token account');
    const ta = await getOrCreateTokenAccount(connection, fromKeyPair, tokenAddress, toPublicKey);
    console.log(`Token account: ${ta}`);
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
const transferSol = async (connection, fromKeyPair, toPublicKey, amount) => {
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

const sendAndConfirmTransaction = async (connection, transaction, keyPair) => {
  const txid = await connection.sendTransaction(transaction, [keyPair], {
    skipPreflight: true,
  });
  const response = await connection.confirmTransaction(txid);
  return { txid, response };
};

const execute = async (connection, transaction, keyPair) => {
  const simulation = await connection.simulateTransaction(transaction, [keyPair]);
  if (simulation) {
    return sendAndConfirmTransaction(connection, transaction, keyPair);
  }
  throw Error('simulation failed');
};

const airdrop = async (connection, publicKey, amount) => {
  const airdropSignature = await connection.requestAirdrop(publicKey, amount * LAMPORTS_PER_SOL);
  return connection.confirmTransaction(airdropSignature);
};

export {
  transferSol,
  transferSpl,
  airdrop,
};
