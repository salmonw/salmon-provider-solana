import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getTokensByOwner, getTokenList } from './solana-token-list-service';
import {
  SOL_DECIMALS, SOL_SYMBOL, SOL_NAME, SOL_LOGO,
} from '../constants/solana-constants';

const {
  decorateBalanceList,
  decorateBalancePrices,
  getLast24HoursChange,
  getPricesByPlatform,
  SOLANA_PLATFORM,
} = require('salmon-provider-base');

const getSolanaBalance = async (connection, publicKey) => {
  const balance = await connection.getBalance(publicKey);
  const uiAmount = balance / LAMPORTS_PER_SOL;
  return {
    mint: publicKey.toBase58(),
    owner: publicKey.toBase58(),
    amount: balance,
    decimals: SOL_DECIMALS,
    uiAmount,
    symbol: SOL_SYMBOL,
    name: SOL_NAME,
    logo: SOL_LOGO,
    address: publicKey.toBase58(),
  };
};

const getTokensBalance = async (connection, publicKey) => {
  const ownerTokens = await getTokensByOwner(connection, publicKey);
  const notEmptyTokens = ownerTokens.filter((t) => t.amount && t.amount > 0);
  const tokens = await getTokenList();
  return decorateBalanceList(notEmptyTokens, tokens);
};

const getBalance = async (connection, publicKey) => {
  const tokensBalance = await getTokensBalance(connection, publicKey);
  const solanaBalance = await getSolanaBalance(connection, publicKey);
  const prices = await getPricesByPlatform(SOLANA_PLATFORM);
  const balances = await decorateBalancePrices([solanaBalance, ...tokensBalance], prices);
  const sortedBalances = balances.sort((a, b) => a.usdBalance < b.usdBalance);
  const usdTotal = balances.reduce(
    (currentValue, next) => (next.usdBalance || 0) + currentValue,
    0,
  );
  const last24HoursChage = getLast24HoursChange(balances, usdTotal);
  return {
    usdTotal,
    last24HoursChage,
    items: sortedBalances,
  };
};

export {
  getBalance,
  getSolanaBalance,
};
