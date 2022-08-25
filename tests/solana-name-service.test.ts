import { PublicKey } from '@solana/web3.js';
import { MNEMONIC } from './config';
import { SolanaAccount } from '../src/SolanaAccount';

const NETWORK_ID = 'mainnet-beta';

test('solana-get-bonfida-domain', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const name = await account.getDomainFromPublicKey(new PublicKey('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb'));
  expect(name).toBe('bonfida.sol');
});

test('solana-get-bonfida-my-domain', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const name = await account.getDomain();
  expect(name).toBe(null);
});

test('solana-get-bonfida-key', async () => {
  const pk: PublicKey = await SolanaAccount.getPublicKeyFromDomain('bonfida.sol');
  expect(pk.toBase58()).toBe('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb');
});
