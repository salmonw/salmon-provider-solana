import {
  PublicKey, Connection, AccountInfo, ParsedAccountData,
} from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';
import { IToken, ITokenBalance } from '@salmonw/provider-base';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

interface ITokenAccountItem {
  pubkey: PublicKey,
  account: AccountInfo<ParsedAccountData>;
}

async function getTokenList():Promise<IToken[]> {
  const tokenListProvider = new TokenListProvider();
  const allTokens = await tokenListProvider.resolve();

  const tokens = allTokens.getList().map((token) => ({
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    logo: token.logoURI,
    address: token.address,
    chainId: token.chainId,
  }));
  return tokens;
}

async function getTokensByOwner(
  connection: Connection,
  publicKey: PublicKey,
): Promise<ITokenBalance[]> {
  const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  const result = response.value.map((item:ITokenAccountItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const account = item.account.data.parsed.info;
    const { mint, owner, tokenAmount } = account;
    const { amount, decimals, uiAmount } = tokenAmount;
    const balanceItem:ITokenBalance = {
      mint, owner, amount, decimals, uiAmount,
    };
    return balanceItem;
  });
  return result;
}

async function getTokenBySymbol(symbol: string): Promise<IToken> {
  const tokens: IToken[] = await getTokenList();
  return tokens.find((t: IToken) => t.symbol === symbol);
}

async function getTokenByAddress(address: string): Promise<IToken> {
  const tokens = await getTokenList();
  return tokens.find((t: IToken) => t.address === address);
}

export {
  getTokenList,
  getTokensByOwner,
  getTokenBySymbol,
  getTokenByAddress,
};
