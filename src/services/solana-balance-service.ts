import { LAMPORTS_PER_SOL, PublicKey, Connection } from '@solana/web3.js';
import {
  decorateBalanceList,
  decorateBalancePrices,
  getLast24HoursChange,
  getPricesByPlatform,
  IBalance,
  IBalanceItem,
  IBalancePrice,
  ICoin,
  IToken,
  ITokenBalance,
  SOLANA_PLATFORM,
} from '@salmonw/provider-base';
import { getTokensByOwner, getTokenList } from './solana-token-list-service';
import {
  SOL_DECIMALS, SOL_SYMBOL, SOL_NAME, SOL_LOGO,
} from '../constants/solana-constants';

const getSolanaBalance = async (
  connection: Connection,
  publicKey: PublicKey,
):Promise<IBalanceItem> => {
  const balance:number = await connection.getBalance(publicKey);
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

const getTokensBalance = async (
  connection: Connection,
  publicKey: PublicKey,
) :Promise<IBalanceItem[]> => {
  const ownerTokens:ITokenBalance[] = await getTokensByOwner(connection, publicKey);
  const notEmptyTokens:ITokenBalance[] = ownerTokens
    .filter((t) => t.amount && t.amount > 0);
  const tokens: IToken[] = await getTokenList();
  return decorateBalanceList(notEmptyTokens, tokens);
};

const getBalance = async (connection: Connection, publicKey: PublicKey) :Promise<IBalance> => {
  const tokensBalance:IBalanceItem[] = await getTokensBalance(connection, publicKey);
  const solanaBalance:IBalanceItem = await getSolanaBalance(connection, publicKey);
  const prices:ICoin[] = await getPricesByPlatform(SOLANA_PLATFORM);
  const balances:IBalanceItem[] = decorateBalancePrices([solanaBalance, ...tokensBalance], prices);
  const sortedBalances:IBalanceItem[] = balances
    .sort((a, b) => (a.usdBalance || 0) - (b.usdBalance || 0));
  const usdTotal:number = balances.reduce(
    (currentValue, next) => (next.usdBalance || 0) + currentValue,
    0,
  );
  const last24HoursChange:IBalancePrice = getLast24HoursChange(balances, usdTotal);
  const result:IBalance = {
    usdTotal,
    last24HoursChange,
    items: sortedBalances,
  };
  return result;
};

export {
  getBalance,
  getSolanaBalance,
};
