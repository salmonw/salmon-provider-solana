import { PublicKey } from '@solana/web3.js';
import { MNEMONIC, TOKEN_ADDRESS, NETWORK_ID } from './config';
import {
  getTokenAccount,
  getAssociatedTokenAddress,
} from '../src/services/solana-token-service';
import { SolanaAccount } from '../src/SolanaAccount';

test('get-assoc-token-address', async () => {
  const account = SolanaAccount.restoreAccount(MNEMONIC, NETWORK_ID);
  const ata = await getAssociatedTokenAddress(
    new PublicKey(TOKEN_ADDRESS),
    account.publicKey,
  );
  expect(ata).toBeDefined();
  expect(ata.toBase58()).toBe('41CQSHF6XZwnfCmm31E63K3JvtTGEoFHrm4DF56uVF1u');
});

test('get-valid-token-account', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account = accounts[0];
  const tokenAccount = await getTokenAccount(
    await account.getConnection(),
    account.publicKey,
    TOKEN_ADDRESS,
  );
  expect(tokenAccount).toBeDefined();
});

test('get-invalid-token-account', async () => {
  const accounts = SolanaAccount.restoreDerivedAccounts(MNEMONIC, NETWORK_ID);
  const account = accounts[9];
  const tokenAccount = await getTokenAccount(
    await account.getConnection(),
    account.publicKey,
    TOKEN_ADDRESS,
  );
  expect(tokenAccount).toBeNull();
});
