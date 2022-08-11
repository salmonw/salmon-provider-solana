import { getTokenList } from '../src/services/solana-token-list-service';

test('solana-token-list-service', async () => {
  const tokenList = await getTokenList();
  expect(tokenList).toBeDefined();
});
