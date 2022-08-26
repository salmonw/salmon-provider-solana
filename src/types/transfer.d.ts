interface ISignature {
  blockTime: number,
  confirmationStatus: string,
  err: unknown,
  memo: unknown[],
  signature: string,
  slot: number,
  data: unknown[]
}

interface IOpts {
  simulate: boolean
}

export {
  IOpts,
  ISignature,
};
