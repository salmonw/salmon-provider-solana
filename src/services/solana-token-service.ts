import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

const getTokenAccount = async (
  connection: Connection,
  destination: PublicKey,
  tokenAddress: string,
) => {
  const assocTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    destination,
  );
  return connection.getAccountInfo(assocTokenAddress);
};

const getOrCreateTokenAccount = async (
  connection: Connection,
  fromKeyPair: Keypair,
  token: string,
  toPublicKey: PublicKey,
) => getOrCreateAssociatedTokenAccount(
  connection,
  fromKeyPair,
  new PublicKey(token),
  toPublicKey,
);

const applyDecimals = (amount: number, decimals: number) => {
  const result = Math.round(parseFloat(amount.toString()) * 10 ** decimals);
  return result;
};

const applyOutDecimals = (amount:number, decimals:number) => {
  const result = parseFloat(amount.toString()) / 10 ** decimals;
  return result;
};

export {
  getTokenAccount,
  getOrCreateTokenAccount,
  getAssociatedTokenAddress,
  applyDecimals,
  applyOutDecimals,
};
