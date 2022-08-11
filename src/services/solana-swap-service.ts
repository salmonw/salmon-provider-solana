import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { applyDecimals, applyOutDecimals } from './solana-token-service';
import { getTokenList } from './solana-token-list-service';
import { SALMON_API_URL } from '../constants/solana-constants';

const quote = async (networkId, inAdress, outAdress, amount, slippage) => {
  const tokens = await getTokenList();
  const inToken = tokens.find((t) => t.address === inAdress);
  const outToken = tokens.find((t) => t.address === outAdress);
  const inputAmount = applyDecimals(amount, inToken.decimals);
  const url = `${SALMON_API_URL}/v1/solana/ft/swap/quote?inputMint=${inAdress}&outputMint=${outAdress}&amount=${inputAmount}&slippage=${slippage}`;
  const response = await axios.get(url, { headers: { 'X-Network-Id': networkId } });
  const route = response.data;
  const uiInfo = routeUiInfo(route, inToken, outToken);
  return { route, uiInfo };
};

const routeUiInfo = (quote, inToken, outToken) => {
  const inUiAmount = applyOutDecimals(quote.inAmount, inToken.decimals);
  const outUiAmount = applyOutDecimals(quote.outAmount, outToken.decimals);
  return {
    in: {
      ...inToken,
      amount: quote.inAmount,
      uiAmount: inUiAmount,
    },
    out: {
      ...outToken,
      amount: quote.outAmount,
      uiAmount: outUiAmount,
    },
  };
};

const createTransaction = async (networkId, connection, keypair, routeId) => {
  const url = `${SALMON_API_URL}/v1/solana/ft/swap/transaction?id=${routeId}&publicKey=${keypair.publicKey}`;
  const response = await axios.get(url, { headers: { 'X-Network-Id': networkId } });
  const { swapTransaction } = response.data;
  const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));

  const simulation = await connection.simulateTransaction(transaction, [keypair]);
  const txid = await connection.sendTransaction(transaction, [keypair], {
    skipPreflight: true,
  });
  return txid;
};

const executeTransaction = async (connection, txId) => await connection.confirmTransaction(txId);

export {
  quote,
  createTransaction,
  executeTransaction,
};
