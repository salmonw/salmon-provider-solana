import { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from '@solana/web3.js';

interface ITokenAccount {
  value: { data: { info: IInsParsedInfo, type: string } }
}

interface IInsParsedInfo {
  source: string,
  destination: string,
  lamports: string,
  owner: string,
  mint: string
}

interface IInsParsed {
  parsed: IInsParsedInfo
}

interface IInstruction {
  parsed: { info: IInsParsedInfo, type: string },
  program: string,
  programId: string,
}
interface IMessage {
  accountKeys: unknown[],
  addressTableLookups: unknown[],
  instructions: IInstruction[],
  recentBlockhash: string,
}

interface ITransaction {
  message: IMessage,
  signatures: string[]
}

interface IMeta {
  err: unknown,
  fee: number,
  innerInstructions: unknown[],
  loadedAddresses: unknown[],
  logMessages: unknown[],
  postBalances: unknown[],
  postTokenBalances: unknown[],
  preBalances: unknown[],
  preTokenBalances: unknown[],
  rewards: unknown[],
  status: unknown[]
}

interface IData {
  blockTime: number,
  meta: IMeta,
  slot: number,
  transaction: ITransaction
}

// interface ISignature {
//   blockTime: number,
//   confirmationStatus: string,
//   err: unknown,
//   memo: unknown[],
//   signature: string,
//   slot: number,
//   data: IData
// }

interface ISignature extends ConfirmedSignatureInfo {
  data: ParsedTransactionWithMeta
}

interface IOpts {
  simulate: boolean
}

export {
  IOpts,
  ISignature,
  ITokenAccount,
  IInsParsedInfo,
  IInsParsed,
};
