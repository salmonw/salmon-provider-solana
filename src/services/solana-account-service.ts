import { SolanaAccount } from '../SolanaAccount';
import {  
  generateDerivedKeyPairs,
  generateFirstKeyPair,
  COIN_TYPE_SOL
} from 'salmon-provider-template';

const DERIVED_COUNT = 10;

const createAccountFromMnemonic = async (mnemonic, networkId) => {
  var { path, index, keyPair } = generateFirstKeyPair(mnemonic, COIN_TYPE_SOL);  
  return new SolanaAccount(mnemonic, keyPair, path, index, networkId);
};

const createDerivedAccountsFromMnemonic = async (mnemonic, networkId) => {
  const keysInfo = generateDerivedKeyPairs(mnemonic, COIN_TYPE_SOL, DERIVED_COUNT);
  let accounts: Array<SolanaAccount> = [];
  for (let keyInfo of keysInfo) {
    const { path, index, keyPair } = keyInfo;
    const account = new SolanaAccount(mnemonic, keyPair, path, index, networkId);
    accounts.push(account);
  }
  return accounts;
};

const restoreAccount = async (mnemonic, args) => {
  return await createAccountFromMnemonic(mnemonic, args);
};

const restoreDerivedAccounts = async (mnemonic, args) => {
  return await createDerivedAccountsFromMnemonic(mnemonic, args);
};

export {
  createAccountFromMnemonic,
  createDerivedAccountsFromMnemonic,
  restoreAccount,
  restoreDerivedAccounts
}
