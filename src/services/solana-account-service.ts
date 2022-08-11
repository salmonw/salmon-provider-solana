import {
  generateDerivedKeyPairs,
  generateFirstKeyPair,
  COIN_TYPE_SOL,
  KeyInfo,
} from 'salmon-provider-base';
import SolanaAccount from '../SolanaAccount';

const DERIVED_COUNT = 10;

const createAccountFromMnemonic = async (mnemonic, networkId) => {
  const { path, index, keyPair } = generateFirstKeyPair(mnemonic, COIN_TYPE_SOL);
  return new SolanaAccount(mnemonic, keyPair, path, index, networkId);
};

const createDerivedAccountsFromMnemonic = async (mnemonic, networkId) => {
  const keysInfo: KeyInfo[] = generateDerivedKeyPairs(mnemonic, COIN_TYPE_SOL, DERIVED_COUNT);
  const accounts: Array<SolanaAccount> = [];
  for (let i = 0; i <= keysInfo.length; i += 1) {
    const { path, index, keyPair } = keysInfo[i];
    const account = new SolanaAccount(mnemonic, keyPair, path, index, networkId);
    accounts.push(account);
  }
  return accounts;
};

const restoreAccount = async (mnemonic, args) => createAccountFromMnemonic(mnemonic, args);

const restoreDerivedAccounts = async (mnemonic, args) => {
  createDerivedAccountsFromMnemonic(mnemonic, args);
};

export {
  createAccountFromMnemonic,
  createDerivedAccountsFromMnemonic,
  restoreAccount,
  restoreDerivedAccounts,
};
