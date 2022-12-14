import { INetwork, INetworkConfigItem } from '@salmonw/provider-base';
import { MNEMONIC, PUBLIC_KEY, NETWORK_ID } from './config';
import { SolanaAccount } from '../src/SolanaAccount';

test('solana-account-get-balance', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  console.log(account);
  const balance = await account.getBalance();
  expect(balance.usdTotal).toBeGreaterThanOrEqual(0);
  expect(balance.items.length).toBeGreaterThan(0);
});

test('solana-validate-destination-account', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account1 = accounts[0];
  const account2 = accounts[5];

  const addr1 = 'GxV4RRUsjs1rZwo6e2fvtjXXK6aYKCYJx4bv1N';
  const addr2 = '8Nb3tg9H55svmywG4NvsHVtw7GpZWdA2Wi6TbXbgTtRR';
  const addr3 = '8Nb3tg9H55svmywG4NvsHVtw7GpZWdA2Wi6TbXbgTtzi';
  const addr4 = account2.publicKey.toBase58();

  const result1 = await account1.validateDestinationAccount(addr1);
  expect(result1.code).toBe('INVALID_ADDRESS');
  expect(result1.type).toBe('ERROR');
  const result2 = await account1.validateDestinationAccount(addr2);
  expect(result2.code).toBe('EMPTY_ACCOUNT');
  expect(result2.type).toBe('WARNING');
  const result3 = await account1.validateDestinationAccount(addr3);
  expect(result3.code).toBe('VALID_ACCOUNT');
  expect(result3.type).toBe('SUCCESS');
  const result4 = await account1.validateDestinationAccount(addr4);
  expect(result4.code).toBe('EMPTY_ACCOUNT');
  expect(result4.type).toBe('WARNING');
});

test('solana-account-get-tokens', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const tokens = await account.getTokens();
  expect(tokens.length).toBeGreaterThan(0);
});

test('solana-account-get-receive-address', () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const receiveAddress = account.getReceiveAddress();
  expect(receiveAddress).toBeDefined();
  expect(receiveAddress).toBe(PUBLIC_KEY);
});

test('solana-get-networks', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const networks = await SolanaAccount.getNetworks();
  console.log(networks);
  expect(networks).toBeDefined();
  expect(networks.length).toBeGreaterThan(0);
});

test('solana-get-network', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const network: INetworkConfigItem = await account.getCurrentNetwork();
  const { networkId } = network;
  expect(network).toBeDefined();
  expect(networkId).toBe(NETWORK_ID);
});

test('solana-set-network', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const networks: INetwork[] = await SolanaAccount.getNetworks();
  const newNetwork: INetwork = networks[1];
  account.setNetwork(newNetwork.id);
  expect(account.networkId).toBe(newNetwork.id);
});

test('solana-get-transactions', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const transactions = await account.getRecentTransactions(undefined);
  // console.log(transactions, '', 4);
  // const size = transactions.filter((t) => t.data).length;
  expect(transactions.length).toBe(8);
});
