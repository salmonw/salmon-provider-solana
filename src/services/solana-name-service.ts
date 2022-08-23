import { performReverseLookup, getDomainKey } from '@bonfida/spl-name-service';
import { PublicKey, Connection } from '@solana/web3.js';

const getDomainName = async (connection: Connection, publicKey: PublicKey) => {
  try {
    const result = await performReverseLookup(connection, publicKey);
    return `${result}.sol`;
  } catch (e) {
    return null;
  }
};

const getPublicKey = async (domainName: string) => {
  const result = await getDomainKey(domainName);
  return result.pubkey;
};

export {
  getDomainName,
  getPublicKey,
};
