import {
  restoreAccount,
  restoreDerivedAccounts,
} from '../src/services/solana-account-service';
import { MNEMONIC } from './config';

const NETWORK_ID = 'mainnet-beta';
const NFT_ADDRESS = 'HBcZBEESoDJkwNkvciNMzyuZ2UrE5Q6RSH6mpqTAsHvV';

test.only('solana-get-all-nfts', async () => {
  const account = await restoreAccount(MNEMONIC, NETWORK_ID);
  const nfts = await account.getAllNfts();
  console.log('all:', nfts);
  expect(nfts).toBeDefined();
  expect(nfts.length).toBeGreaterThan(0);
});

test.only('solana-get-all-nfts-grouped', async () => {
  const account = await restoreAccount(MNEMONIC, NETWORK_ID);
  const nfts = await account.getAllNftsGrouped();
  console.log('grouped:', nfts);
  expect(nfts).toBeDefined();
  expect(nfts.length).toBeGreaterThan(0);
});

// Transfer test are skipped
test('nft-create-token-account', async () => {
  const accounts = await restoreDerivedAccounts(MNEMONIC, NETWORK_ID );
  const account1 = accounts[0];
  const account2 = accounts[1];
  const ta = await account1.getOrCreateTokenAccount(account2.publicKey, NFT_ADDRESS);
  expect(ta).toBeDefined();
});

test('solana-transfer-nft', async () => {
  const accounts = await restoreDerivedAccounts( MNEMONIC, NETWORK_ID );
  const account1 = accounts[0];
  const account2 = accounts[1];
  const amount = 1;
  const transaction1 = await account1.transfer(account2.publicKey.toBase58(), NFT_ADDRESS, amount);
  expect(transaction1).toBeDefined();
  const transaction2 = await account2.transfer(account1.publicKey.toBase58(), NFT_ADDRESS, amount);
  expect(transaction2).toBeDefined();
});
