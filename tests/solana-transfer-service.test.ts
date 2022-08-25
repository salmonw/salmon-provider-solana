import { SOL_ADDRESS } from '../src/constants/solana-constants';
import { MNEMONIC, TOKEN_ADDRESS, NETWORK_ID } from './config';
import { SolanaAccount } from '../src/SolanaAccount';

test.only('solana-estimate-fee-transfer-sol', async () => {
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
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
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
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
  const opts = { simulate: false };
  const result1 = await account1.createTransferTransaction(
    account2.publicKey.toBase58(),
    SOL_ADDRESS,
    amount,
    opts,
  );
  expect(result1).toBeDefined();
  console.log(`Transaction sign ${result1}`);
  const result2 = await account2.createTransferTransaction(
    account1.publicKey.toBase58(),
    SOL_ADDRESS,
    amount,
    opts,
  );
  expect(result2).toBeDefined();
  console.log(`Transaction sign ${result2}`);
});

test.only('solana-transfer-token', async () => {
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 11;
  const opts = { simulate: false };
  const result1 = await account1.createTransferTransaction(
    account2.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
    opts,
  );
  expect(result1).toBeDefined();
  console.log(`Transaction sign ${result1}`);
  const result2 = await account2.createTransferTransaction(
    account1.publicKey.toBase58(),
    TOKEN_ADDRESS,
    amount,
    opts,
  );
  expect(result2).toBeDefined();
  console.log(`Transaction sign ${result2}`);
});

test.only('solana-confirm-transfer', async () => {
  const accounts = await SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const result = await account1.confirmTransferTransaction(
    '2P9GS1gorxeUPRcga8toTfHERKs3VYjfXrwFNVyZGcWDam1e5wUPJ8mHj87ZypqkbhrGsNyFoiTj1sKM6tjYzXeV',
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
