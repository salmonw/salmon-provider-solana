import { Account } from '@salmonw/provider-base';
import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { INetwork } from '@salmonw/provider-base/src/types/config';
import { SOL_ADDRESS, SOLANA } from './constants/solana-constants';
import * as nftService from './services/solana-nft-service';
import * as balanceService from './services/solana-balance-service';
import * as tokenListService from './services/solana-token-list-service';
import * as transferService from './services/solana-transfer-service';
import * as tokenService from './services/solana-token-service';
import * as swapService from './services/solana-swap-service';
import * as nameService from './services/solana-name-service';
import * as validationService from './services/solana-validation-service';
import * as configService from './services/solana-config-service';
import * as recentTransactionsService from './services/solana-recent-transactions-service';
import * as seedService from './services/solana-seed-service';

class SolanaAccount extends Account<Keypair, PublicKey, Connection> {
  static DERIVED_COUNT = 10;

  signatures?: object[];

  publicKey: PublicKey;

  path : string;

  index : number;

  networkId : string;

  chain : string;

  connection?: Connection;

  constructor(mnemonic: string, keyPair: Keypair, path: string, index: number, networkId: string) {
    super(mnemonic, keyPair, path, index, networkId);
    this.chain = SOLANA;
  }

  static restoreAccount(
    mnemonic: string,
    networkId: string,
  ):SolanaAccount {
    const { path, index, keyPair } = seedService.generateFirstKeyPair(mnemonic);
    return new SolanaAccount(mnemonic, keyPair, path, index, networkId);
  }

  static restoreDerivedAccounts(
    mnemonic: string,
    networkId: string,
  ): SolanaAccount[] {
    const keysInfo: seedService.KeyInfo[] = seedService
      .generateDerivedKeyPairs(mnemonic, SolanaAccount.DERIVED_COUNT);
    const accounts: SolanaAccount[] = [];
    for (let i = 0; i < keysInfo.length; i += 1) {
      const { path, index, keyPair } = keysInfo[i];
      const account = new SolanaAccount(mnemonic, keyPair, path, index, networkId);
      accounts.push(account);
    }
    return accounts;
  }

  setPublicKey(keyPair: Keypair) {
    this.publicKey = keyPair.publicKey;
  }

  async getConnection():Promise<Connection> {
    if (!this.connection) {
      const { nodeUrl } : { nodeUrl: string } = await configService.getConfig(this.networkId);
      this.connection = new Connection(nodeUrl);
    }
    return this.connection;
  }

  async getTokens() {
    const connection:Connection = await this.getConnection();
    return tokenListService.getTokensByOwner(connection, this.publicKey);
  }

  async getBalance() {
    const connection = await this.getConnection();
    return balanceService.getBalance(connection, this.publicKey);
  }

  getReceiveAddress() {
    return this.publicKey.toBase58();
  }

  async getOrCreateTokenAccount(toPublicKey: PublicKey, token: string) {
    const connection = await this.getConnection();
    return tokenService.getOrCreateTokenAccount(
      connection,
      super.retrieveSecureKeyPair(),
      token,
      toPublicKey,
    );
  }

  async validateDestinationAccount(address: string) {
    const connection = await this.getConnection();
    return validationService.validateDestinationAccount(connection, address);
  }

  async transfer(destination: string, token: string, amount: number): Promise<string> {
    const connection = await this.getConnection();
    if (token === SOL_ADDRESS) {
      return transferService.transferSol(
        connection,
        super.retrieveSecureKeyPair(),
        new PublicKey(destination),
        amount,
      );
    }
    return transferService.transferSpl(
      connection,
      super.retrieveSecureKeyPair(),
      new PublicKey(destination),
      token,
      amount,
    );
  }

  async airdrop(amount: number) {
    const connection = await this.getConnection();
    return transferService.airdrop(connection, this.publicKey, amount);
  }

  async getAllNfts() {
    return nftService.getAll(this.networkId, this.publicKey.toBase58());
  }

  async getAllNftsGrouped() {
    return nftService.getAllGroupedByCollection(this.networkId, this.publicKey.toBase58());
  }

  async getBestSwapQuote(inToken: string, outToken: string, amount: number, slippage = 0.5) {
    return swapService.quote(this.networkId, inToken, outToken, amount, slippage);
  }

  async createSwapTransaction(routeId: string): Promise<string> {
    const connection = await this.getConnection();
    return swapService.createTransaction(
      this.networkId,
      connection,
      super.retrieveSecureKeyPair(),
      routeId,
    );
  }

  async executeSwapTransaction(txId: string) {
    const connection = await this.getConnection();
    return swapService.executeTransaction(connection, txId);
  }

  async getRecentTransactions(lastSignature) {
    const connection:Connection = await this.getConnection();
    if (this.signatures === null) {
      this.signatures = await connection.getSignaturesForAddress(this.publicKey);
    }
    return recentTransactionsService.list(
      connection,
      this.signatures,
      this.publicKey,
      lastSignature,
    );
  }

  setNetwork(networkId) {
    if (this.networkId !== networkId) {
      this.networkId = networkId;
      this.connection = undefined;
    }
  }

  static async getNetworks() :Promise<INetwork[]> {
    return configService.getNetworks();
  }

  async getCurrentNetwork() {
    return configService.getConfig(this.networkId);
  }

  getChain() {
    return this.chain;
  }

  async getDomain() {
    const connection = await this.getConnection();
    return nameService.getDomainName(connection, this.publicKey);
  }

  static async getPublicKeyFromDomain(domain: string) {
    return nameService.getPublicKey(domain);
  }

  async getDomainFromPublicKey(publicKey: PublicKey) {
    const connection = await this.getConnection();
    return nameService.getDomainName(connection, publicKey);
  }
}

export {
  SolanaAccount,
};
