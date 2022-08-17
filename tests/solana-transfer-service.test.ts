import { SOL_ADDRESS } from '../src/constants/solana-constants';
import { MNEMONIC, TOKEN_ADDRESS, NETWORK_ID } from './config';
import SolanaAccount from '../src/SolanaAccount';

test.only('solana-transfer-sol', async () => {
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 1;
  const result1 = await account1.transfer(account2.publicKey.toBase58(), SOL_ADDRESS, amount);
  expect(result1).toBeDefined();
  // console.log(`Transaction id ${result1}`);
  const result2 = await account2.transfer(account1.publicKey.toBase58(), SOL_ADDRESS, amount);
  expect(result2).toBeDefined();
  // console.log(`Transaction id ${result2}`);
});

test('solana-transfer-token', async () => {
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 1;
  const result1 = await account1.transfer(account2.publicKey.toBase58(), TOKEN_ADDRESS, amount);
  expect(result1).toBeDefined();
  // console.log(`Transaction id ${result1}`);
  // Back amount to mantain balance
  const result2 = await account2.transfer(account1.publicKey.toBase58(), TOKEN_ADDRESS, amount);
  expect(result2).toBeDefined();
  // console.log(`Transaction id ${result2}`);
});

/*
test('solana-account-airdrop', async() => {
  const account = await SolanaAccount.restoreAccount(SOLANA, MNEMONIC, NETWORK_ID);
  const result = await account.airdrop(1);
  console.log(JSON.stringify(result, null, "\t"));
});
*/
