import { Account } from 'salmon-provider-base';
import { Connection, PublicKey } from '@solana/web3.js';
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

export default class SolanaAccount extends Account {

  signatures?: object[];

  publicKey: PublicKey;

  path : string;

  index : number;

  networkId : string;

  chain : string;

  connection?: Connection;

  constructor(mnemonic: string, keyPair: any, path: string, index: number, networkId: string) {
    super(mnemonic, keyPair, path, index, networkId);
    this.chain = SOLANA;
  }

  async getConnection():Promise<any> {
    if (!this.connection) {
      const { nodeUrl } = await configService.getConfig(this.networkId);
      this.connection = new Connection(nodeUrl);
    }
    return this.connection;
  }

  async getTokens() {
    const connection = await this.getConnection();
    return tokenListService.getTokensByOwner(connection, this.publicKey);
  }

  async getBalance() {
    const connection = await this.getConnection();
    return balanceService.getBalance(connection, this.publicKey);
  }

  getReceiveAddress() {
    return this.publicKey.toBase58();
  }

  async getOrCreateTokenAccount(toPublicKey, token) {
    const connection = await this.getConnection();
    return tokenService.getOrCreateTokenAccount(
      connection,
      super.retrieveSecureKeyPair(),
      token,
      toPublicKey,
    );
  }

  async validateDestinationAccount(address) {
    const connection = await this.getConnection();
    return validationService.validateDestinationAccount(connection, address);
  }

  async transfer(destination, token, amount) {
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

  async airdrop(amount) {
    const connection = await this.getConnection();
    return transferService.airdrop(connection, this.publicKey, amount);
  }

  async getAllNfts() {
    return nftService.getAll(this.networkId, this.publicKey.toBase58());
  }

  async getAllNftsGrouped() {
    return nftService.getAllGroupedByCollection(this.networkId, this.publicKey.toBase58());
  }

  async getBestSwapQuote(inToken, outToken, amount, slippage = 0.5) {
    return swapService.quote(this.networkId, inToken, outToken, amount, slippage);
  }

  async createSwapTransaction(routeId) {
    const connection = await this.getConnection();
    return swapService.createTransaction(
      this.networkId,
      connection,
      super.retrieveSecureKeyPair(),
      routeId,
    );
  }

  async executeSwapTransaction(txId) {
    const connection = await this.getConnection();
    return swapService.executeTransaction(connection, txId);
  }

  async getRecentTransactions(lastSignature) {
    const connection = await this.getConnection();
    if (!this.signatures) {
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

  static async getNetworks() {
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

  static async getPublicKeyFromDomain(domain) {
    return nameService.getPublicKey(domain);
  }

  async getDomainFromPublicKey(publicKey) {
    const connection = await this.getConnection();
    return nameService.getDomainName(connection, publicKey);
  }
}
