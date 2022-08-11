import { PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';

const getTokenAccount = async (connection, destination, tokenAddress) => {
  const assocTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    destination,
  );
  return connection.getAccountInfo(assocTokenAddress);
};

const getOrCreateTokenAccount = async (
  connection,
  fromKeyPair,
  token,
  toPublicKey,
) => getOrCreateAssociatedTokenAccount(
  connection,
  fromKeyPair,
  new PublicKey(token),
  toPublicKey,
);

const applyDecimals = (amount, decimals) => Math.round(parseFloat(amount) * 10 ** decimals);

const applyOutDecimals = (amount, decimals) => parseFloat(amount) / 10 ** decimals;

export {
  getTokenAccount,
  getOrCreateTokenAccount,
  getAssociatedTokenAddress,
  applyDecimals,
  applyOutDecimals,
};
