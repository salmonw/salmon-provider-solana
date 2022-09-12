import axios from 'axios';
import { Connection, Keypair, Transaction } from '@solana/web3.js';
import { IToken } from '@salmonw/provider-base';
import { applyDecimals, applyOutDecimals } from './solana-token-service';
import { getTokenList } from './solana-token-list-service';
import { SALMON_API_URL, SOL_ADDRESS } from '../constants/solana-constants';
import { IJupiterRoute, IRouteUiInfo, IJupiterPriceRoute } from '../types/swap';

const BASE_ENDPOINT_JUP = 'https://price.jup.ag';
const PRICE_ENDPOINT_JUP = `${BASE_ENDPOINT_JUP}/v1/price`;

const routeUiInfo = (quote: IJupiterRoute, inToken:IToken, outToken:IToken) => {
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

const calculateFee = async (route: IJupiterRoute, uiInfo: IRouteUiInfo) => {
  let solAmountIn: number;
  const infoIn = uiInfo.in;
  if (infoIn.address === SOL_ADDRESS) {
    solAmountIn = infoIn.uiAmount;
  } else {
    const url = `${PRICE_ENDPOINT_JUP}?id=${infoIn.address}&vsToken=SOL`;
    const response = await axios.get(url);
    const jupPriceRoute: IJupiterPriceRoute = response.data;
    solAmountIn = jupPriceRoute.data.price * infoIn.uiAmount;
  }

  let solAmountMinusFees = solAmountIn;
  route.marketInfos.forEach((info) => {
    solAmountMinusFees -= solAmountMinusFees * info.lpFee.pct;
  });

  const totalFee = solAmountIn - solAmountMinusFees;
  return totalFee < 0.000001 ? 0.000001 : totalFee;
};

const quote = async (
  networkId :string,
  inAdress :string,
  outAdress :string,
  publicKey :string,
  amount :number,
  slippage :number,
) => {
  const tokens:IToken[] = await getTokenList();
  const inValidAddress = inAdress === publicKey ? SOL_ADDRESS : inAdress;
  const outValidAddress = outAdress === publicKey ? SOL_ADDRESS : outAdress;
  const inToken:IToken | undefined = tokens.find((t:IToken) => t.address === inValidAddress);
  if (inToken === undefined) throw (Error('in token undefined'));
  const outToken:IToken | undefined = tokens.find((t) => t.address === outValidAddress);
  if (outToken === undefined) throw (Error('in token undefined'));
  const inputAmount = applyDecimals(amount, inToken.decimals);
  const url = `${SALMON_API_URL}/v1/solana/ft/swap/quote?inputMint=${inValidAddress}&outputMint=${outValidAddress}&amount=${inputAmount}&slippage=${slippage}`;
  const response = await axios.get(url, { headers: { 'X-Network-Id': networkId } });
  const route:IJupiterRoute = response.data;
  const uiInfo = routeUiInfo(route, inToken, outToken);
  const fee = await calculateFee(route, uiInfo);
  return { route, uiInfo, fee };
};

const createTransaction = async (
  networkId :string,
  connection :Connection,
  keypair :Keypair,
  routeId :string,
) => {
  const url = `${SALMON_API_URL}/v1/solana/ft/swap/transaction?id=${routeId}&publicKey=${keypair.publicKey.toBase58()}`;
  const response = await axios.get(url, { headers: { 'X-Network-Id': networkId } });
  const { swapTransaction } : { swapTransaction:string } = response.data;
  const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));

  const simulation = await connection.simulateTransaction(transaction, [keypair]);
  if (simulation.value.err) {
    throw Error(`simulation failed: ${JSON.stringify(simulation.value.err)}`);
  }
  const txid = await connection.sendTransaction(transaction, [keypair], {
    skipPreflight: true,
  });
  return txid;
};

const executeTransaction = async (
  connection :Connection,
  txId :string,
) => connection.confirmTransaction(txId);

export {
  quote,
  createTransaction,
  executeTransaction,
};
