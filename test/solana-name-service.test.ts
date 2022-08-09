import { restoreAccount } from '../src/services/solana-account-service';
import { MNEMONIC } from './config';
const NETWORK_ID = 'mainnet-beta';

test('solana-get-bonfida-domain', async () => {
  const account = await restoreAccount(MNEMONIC, { networkId: NETWORK_ID });
  const name = await account.getDomainFromPublicKey('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb');
  expect(name).toBe('bonfida.sol');
});

test('solana-get-bonfida-my-domain', async () => {
  const account = await restoreAccount(MNEMONIC, { networkId: NETWORK_ID });
  const name = await account.getDomain();
  expect(name).toBe(null);
});

test('solana-get-bonfida-key', async () => {
  const account = await restoreAccount(MNEMONIC, { networkId: NETWORK_ID });
  const pk = await account.getPublicKeyFromDomain('bonfida.sol');
  expect(pk.toBase58()).toBe('Crf8hzfthWGbGbLTVCiqRqV5MVnbpHB1L9KQMd6gsinb');
});
