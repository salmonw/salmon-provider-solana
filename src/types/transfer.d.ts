import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  PublicKey,
  LoadedAddresses,
  ParsedInnerInstruction,
  TokenBalance,
} from '@solana/web3.js';

interface IInsParsedInfo {
  source: string,
  destination: string,
  lamports: string,
  owner: string,
  mint: string,
  amount: string
}

interface IInsParsed {
  parsed: IInsParsedInfo
}

interface IInstruction {
  parsed?: { info: IInsParsedInfo, type: string },
  program?: string,
  programId?: PublicKey,
}

interface IMessage {
  accountKeys: unknown[],
  addressTableLookups?: unknown[],
  instructions: IInstruction[],
  recentBlockhash: string,
}

interface IMeta {
  err: unknown,
  fee: number,
  innerInstructions?: ParsedInnerInstruction[] | null,
  loadedAddresses?: LoadedAddresses,
  logMessages?: unknown[],
  postBalances: unknown[],
  postTokenBalances?: TokenBalance[] | null,
  preBalances: unknown[],
  preTokenBalances?: TokenBalance[] | null,
  rewards?: unknown[],
  status?: unknown[]
}

interface ISignature extends ConfirmedSignatureInfo {
  data?: ParsedTransactionWithMeta | null
}

export {
  ISignature,
  IInsParsedInfo,
  IInsParsed,
  IMessage,
  IMeta,
  IInstruction,
};
