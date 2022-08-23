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

export {
  IJupiterRoute,
  IJupiterMarketInfo,
  IJupiterFee,
};
