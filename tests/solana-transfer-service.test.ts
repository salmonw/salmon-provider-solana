import { SOL_ADDRESS } from '../src/constants/solana-constants';
import { MNEMONIC, TOKEN_ADDRESS, NETWORK_ID } from './config';
import { SolanaAccount } from '../src/SolanaAccount';

test.only('solana-estimate-fee-transfer-sol', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 0.2;
  const fee = await account1.estimateTransferFee(
    account2.publicKey.toBase58(),
    SOL_ADDRESS,
    amount,
  );
  console.log(`Transaction estimated fee ${fee}`);
});

test.only('solana-estimate-fee-transfer-token', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 10;
  const fee = await account1.estimateTransferFee(
    account2.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
  );
  console.log(`Transaction estimated fee ${fee}`);
});

test.only('solana-transfer-sol', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 0.2;
  const result1 = await account1.createTransferTransaction(
    account2.publicKey.toBase58(),
    SOL_ADDRESS,
    amount,
  );
  expect(result1).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result1)}`);
  const result2 = await account2.createTransferTransaction(
    account1.publicKey.toBase58(),
    SOL_ADDRESS,
    amount,
  );
  expect(result2).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result2)}`);
});

test.only('solana--create-transfer-token', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 11;
  const result1 = await account1.createTransferTransaction(
    account2.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
  );
  expect(result1).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result1)}`);
  const result2 = await account2.createTransferTransaction(
    account1.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
  );
  expect(result2).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result2)}`);
});

test.only('solana-transfer-token', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 11;
  const result1 = await account1.transfer(
    account2.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
  );
  expect(result1).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result1)}`);
  const result2 = await account2.transfer(
    account1.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
  );
  expect(result2).toBeDefined();
  console.log(`Transaction sign ${JSON.stringify(result2)}`);
});

test.only('solana-confirm-transfer', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const result = await account1.confirmTransferTransaction(
    '5SHyr3EmxtExtk1BiN4UYq73Z2fboUtRo3gLLkS2Tb8wGSHUdQ2Yn5TUDnzmmkRdjHFvX3XM6fJoWpuYfLwy3Tcc',
  );
  expect(result).toBeDefined();
  console.log(`Transaction id ${JSON.stringify(result)}`);
});

/*
test('solana-account-airdrop', async() => {
  const account = await SolanaAccount.restoreAccount(SOLANA, MNEMONIC, NETWORK_ID);
  const result = await account.airdrop(1);
  console.log(JSON.stringify(result, null, "\t"));
});
*/
