import { PublicKey } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
);

const getTokenAccount = async (connection, destination, tokenAddress) => {
  const assocTokenAddress = await getAssociatedTokenAddress(
    new PublicKey(tokenAddress),
    destination
  );
  return await connection.getAccountInfo(assocTokenAddress);
};

const getOrCreateTokenAccount = async (connection, fromKeyPair, token, toPublicKey) => {
  return await getOrCreateAssociatedTokenAccount(
    connection,
    fromKeyPair,
    new PublicKey(token),
    toPublicKey
  );
};

const applyDecimals = (amount, decimals) => {
  return Math.round(parseFloat(amount) * 10 ** decimals);
};

const applyOutDecimals = (amount, decimals) => {
  return parseFloat(amount) / 10 ** decimals;
};

export {
  getTokenAccount,
  getOrCreateTokenAccount,
  getAssociatedTokenAddress,
  applyDecimals,
  applyOutDecimals,
};
