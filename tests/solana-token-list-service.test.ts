import { getTokenList } from '../src/services/solana-token-list-service';

const CLUSTER_SLUG = 'mainnet-beta';

test('solana-token-list-service', async () => {
  const tokenList = await getTokenList();
  expect(tokenList).toBeDefined();
});
