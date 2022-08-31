import {
  ConfirmedSignatureInfo,
  ParsedTransactionWithMeta,
  PublicKey,
} from '@solana/web3.js';

interface IToken {
  symbol: string,
  name: string,
  decimals: number,
  logo: string,
  address: string,
  chainId: number
}

interface IInsParsedInfo {
  source: string,
  destination: string,
  lamports: string,
  owner: string,
  mint: string,
  amount: string
}

interface IInsParsed {
  info: IInsParsedInfo,
  type: string,
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

interface ISignature extends ConfirmedSignatureInfo {
  data?: ParsedTransactionWithMeta | null
}

interface ISignatureWithData extends ConfirmedSignatureInfo {
  data: ParsedTransactionWithMeta
}

export {
  IToken,
  ISignature,
  ISignatureWithData,
  IInsParsedInfo,
  IInsParsed,
  IMessage,
  IInstruction,
};
