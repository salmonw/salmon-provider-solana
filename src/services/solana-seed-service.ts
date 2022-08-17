import * as bip39 from 'bip39';
import { Keypair } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';
import {
  COIN_TYPE_SOL, generatePath, generateMnemonicAndSeed, mnemonicToSeed } from '@salmonw/provider-base'

interface KeyInfo {
  path: string,
  index: number,
  keyPair: Keypair
}

function generateKeyPairByIndex(seed, index): KeyInfo {
  const path = generatePath(COIN_TYPE_SOL, index);
  const keyPair = Keypair.fromSeed(derivePath(path, seed.toString('hex')).key);
  return { path, index, keyPair };
}

function generateFirstKeyPair(mnemonic): KeyInfo {
  const seed = bip39.mnemonicToSeedSync(mnemonic, '');
  return generateKeyPairByIndex(seed, 0);
}

function generateDerivedKeyPairs(mnemonic, count) : KeyInfo[] {
  const derivedKeys = [];
  const seed = bip39.mnemonicToSeedSync(mnemonic, '');
  for (let i = 0; i < count; i += 1) {
    const { path, index, keyPair } = generateKeyPairByIndex(seed, i);
    derivedKeys.push({ path, index, keyPair });
  }
  return derivedKeys;
}

export {
  generateMnemonicAndSeed,
  mnemonicToSeed,
  generateFirstKeyPair,
  generateDerivedKeyPairs,
  KeyInfo,
};
