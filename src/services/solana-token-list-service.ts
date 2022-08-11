import { PublicKey } from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

async function getTokenList() {
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

async function getTokensByOwner(connection, publicKey) {
  const response = await connection.getParsedTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  });
  const result = response.value.map((item) => {
    const account = item.account.data.parsed.info;
    const { tokenAmount } = account;
    const { mint, owner } = account;
    const { amount, decimals, uiAmount } = tokenAmount;
    return {
      mint, owner, amount, decimals, uiAmount,
    };
  });
  return result;
}

async function getTokenBySymbol(symbol) {
  const tokens = await getTokenList();
  return tokens.filter((t) => t.symbol == symbol);
}

async function getTokenByAddress(address) {
  const tokens = await getTokenList();
  return tokens.filter((t) => t.address == address);
}

export {
  getTokenList,
  getTokensByOwner,
  getTokenBySymbol,
  getTokenByAddress,
};
