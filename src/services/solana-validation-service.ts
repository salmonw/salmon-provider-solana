import { PublicKey } from '@solana/web3.js';

const INVALID_ADDRESS = {
  type: 'ERROR',
  code: 'INVALID_ADDRESS',
};
const EMPTY_ACCOUNT = {
  type: 'WARNING',
  code: 'EMPTY_ACCOUNT',
};
const NO_FUNDS = {
  type: 'WARNING',
  code: 'NO_FUNDS',
};

const VALID_ACCOUNT = {
  type: 'SUCCESS',
  code: 'VALID_ACCOUNT',
};

const validateDestinationAccount = async (connection, address) => {
  let publicKey = null;
  try {
    publicKey = new PublicKey(address);
  } catch {
    return INVALID_ADDRESS;
  }

  const isValidAddress = PublicKey.isOnCurve(publicKey);
  if (!isValidAddress) return INVALID_ADDRESS;

  const accountInfo = await connection.getAccountInfo(publicKey);
  if (accountInfo == null) return EMPTY_ACCOUNT;
  if (accountInfo.lamports === 0) return NO_FUNDS;
  return VALID_ACCOUNT;
};

export default validateDestinationAccount;
