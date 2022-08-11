import { PublicKey } from '@solana/web3.js';
import {
  restoreAccount,
  restoreDerivedAccounts,
} from '../src/services/solana-account-service';
import { SOLANA } from '../src/constants/solana-constants';
import { MNEMONIC, TOKEN_ADDRESS, NETWORK_ID } from './config';
import {
  getTokenAccount,
  getAssociatedTokenAddress,
} from '../src/services/solana-token-service';

test('get-assoc-token-address', async () => {
  const account = await restoreAccount(MNEMONIC, NETWORK_ID);
  const ata = await getAssociatedTokenAddress(
    new PublicKey(TOKEN_ADDRESS),
    account.publicKey,
  );
  expect(ata).toBeDefined();
  expect(ata.toBase58()).toBe('41CQSHF6XZwnfCmm31E63K3JvtTGEoFHrm4DF56uVF1u');
});

test('get-valid-token-account', async () => {
  const accounts = await restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account = accounts[0];
  const tokenAccount = await getTokenAccount(
    await account.getConnection(),
    account.publicKey,
    TOKEN_ADDRESS,
  );
  expect(tokenAccount).toBeDefined();
});

test('get-invalid-token-account', async () => {
  const accounts = await restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account = accounts[9];
  const tokenAccount = await getTokenAccount(
    await account.getConnection(),
    account.publicKey,
    TOKEN_ADDRESS,
  );
  expect(tokenAccount).toBeNull();
});
