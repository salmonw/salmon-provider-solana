import { IToken } from '@salmonw/provider-base';

interface IJupiterFee {
  amount: number,
  mint: string,
  pct: number
}

interface IJupiterMarketInfo {
  id: string,
  label: string,
  inputMint: string,
  outputMint: string,
  inAmount: number,
  outAmount: number,
  lpFee: IJupiterFee,
  platformFee: IJupiterFee,
  notEnoughLiquidity: boolean,
  priceImpactPct: boolean
}

interface IJupiterRoute {
  id: string,
  inAmount: number,
  outAmount: number,
  otherAmountThreshold: number,
  outAmountWithSlippage: number,
  swapMode: string,
  priceImpactPct: number,
  marketInfos: IJupiterMarketInfo[],
}

interface IJupiterPriceRoute {
  data: IJupiterPriceRouteData,
  timeTaken: number,
  contextSlot: string,
}

interface IJupiterPriceRouteData {
  id: string,
  mintSymbol: string,
  vsToken: string,
  vsTokenSymbol: string,
  price: number,
}

interface IRouteUiInfoToken extends IToken {
  amount: number,
  uiAmount: number,
}

interface IRouteUiInfo {
  in: IRouteUiInfoToken,
  out: IRouteUiInfoToken,
}

export {
  IJupiterRoute,
  IJupiterMarketInfo,
  IJupiterFee,
  IJupiterPriceRoute,
  IRouteUiInfo,
};
