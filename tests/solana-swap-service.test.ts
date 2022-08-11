import { restoreAccount } from '../src/services/solana-account-service';
import { MNEMONIC, NETWORK_ID } from './config';
import { USDC_ADDRESS, SOL_ADDRESS } from '../src/constants/solana-constants';

const ACCESS_TOKEN = 'AhIyTpCFdC4MuWbI4kLLptGvhJaueZq6Tskx7g6FUQ3zmN85u9xHrKkxRP19myn8';

test.only('solana-swap-quote', async () => {
  const account = await restoreAccount(MNEMONIC, {
    networkId: NETWORK_ID,
    params: { accessToken: ACCESS_TOKEN },
  });
  const amount = 100;
  const slippage = 0.5;
  const quote = await account.getBestSwapQuote(USDC_ADDRESS, SOL_ADDRESS, amount, slippage);
  console.log(quote);
});

test.only('solana-create-swap', async () => {
  const account = await restoreAccount(MNEMONIC, NETWORK_ID);
  const amount = 0.009;
  const slippage = 0.5;
  const quote = await account.getBestSwapQuote(SOL_ADDRESS, USDC_ADDRESS, amount, slippage);
  console.log(quote);
  const txId = await account.createSwapTransaction(quote.route.id);
  console.log(txId);
});

test.only('solana-execute-swap', async () => {
  const account = await restoreAccount(MNEMONIC, NETWORK_ID);
  const amount = 0.01;
  const slippage = 0.5;
  const quote = await account.getBestSwapQuote(SOL_ADDRESS, USDC_ADDRESS, amount, slippage);
  console.log(quote);
  const txId = await account.createSwapTransaction(quote.route.id);
  console.log(txId);
  const result = await account.executeSwapTransaction(txId);
  console.log(result);
});
