import {
  generateDerivedKeyPairs,
  generateFirstKeyPair,
  KeyInfo,
} from './solana-seed-service';
import SolanaAccount from '../SolanaAccount';

const DERIVED_COUNT = 10;

const createAccountFromMnemonic = async (mnemonic, networkId) => {
  const { path, index, keyPair } = generateFirstKeyPair(mnemonic);
  return new SolanaAccount(mnemonic, keyPair, path, index, networkId);
};

const createDerivedAccountsFromMnemonic = async (mnemonic, networkId) => {
  const keysInfo: KeyInfo[] = generateDerivedKeyPairs(mnemonic, DERIVED_COUNT);  
  const accounts: SolanaAccount[] = [];  
  for (let i = 0; i < keysInfo.length; i += 1) {    
    const { path, index, keyPair } = keysInfo[i];
    const account = new SolanaAccount(mnemonic, keyPair, path, index, networkId);
    accounts.push(account);
  }
  return accounts;
};

const restoreAccount = async (mnemonic, networkId) => createAccountFromMnemonic(mnemonic, networkId);
const restoreDerivedAccounts = async (mnemonic, networkId) => createDerivedAccountsFromMnemonic(mnemonic, networkId);

export {
  createAccountFromMnemonic,
  createDerivedAccountsFromMnemonic,
  restoreAccount,
  restoreDerivedAccounts,
};
