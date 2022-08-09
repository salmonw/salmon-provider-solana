import { performReverseLookup, getDomainKey } from '@bonfida/spl-name-service';
import { PublicKey } from '@solana/web3.js';

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx');

const getDomainName = async (connection, publicKey) => {
  try {
    const result = await performReverseLookup(connection, new PublicKey(publicKey));
    return `${result}.sol`;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getPublicKey = async (domainName) => {
  const result = await getDomainKey(domainName);
  return result.pubkey;
};

export {
  getDomainName,
  getPublicKey,
};
