import {
  Connection,
  PublicKey,
  ParsedAccountData,
  AccountInfo,
  RpcResponseAndContext,
  ParsedTransactionMeta,
  ParsedInstruction,
  ParsedInnerInstruction,
  TokenBalance,
} from '@solana/web3.js';
import * as tokenListService from './solana-token-list-service';
import * as nftService from './solana-nft-service';
import {
  ISignatureWithData,
  IInsParsed,
  IInsParsedInfo,
  IMessage,
  IInstruction,
  IToken,
} from '../types/transfer';

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}

const getTokenInfo = async (tokenAddress: string | null, connection: Connection) => {
  let tokenAccount: RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>;
  if (tokenAddress) {
    tokenAccount = await
    connection.getParsedAccountInfo(new PublicKey(tokenAddress));
    let tokenData: Buffer | ParsedAccountData | null;
    if (notEmpty(tokenAccount.value)) {
      tokenData = tokenAccount.value.data;
      const { parsed } = tokenData as { parsed: IInsParsed };
      const { info } = parsed;
      return tokenListService.getTokenByAddress(info.mint);
    }
  }
  return null;
};

const getNftInfo = async (metaFirstIns: IInstruction[] | undefined, publicKey: PublicKey) => {
  if (notEmpty(metaFirstIns)) {
    const nftAddress = metaFirstIns.filter(
      (ins) => notEmpty(ins.parsed)
      && ins.parsed.info.owner === publicKey.toBase58() && ins.parsed.info.mint,
    )[0]?.parsed?.info?.mint;
    if (nftAddress) {
      return nftService.getNftByAddress(nftAddress);
    }
  }
  return null;
};

const getSwapInfo = (
  innerInstructions: ParsedInnerInstruction[] | null,
  isOut: boolean,
) => {
  const getParsedInfo = (ins: IInstruction | undefined) => {
    if (typeof ins !== 'undefined') {
      const { parsed } = ins;
      if (typeof parsed !== 'undefined') {
        return parsed.info;
      }
    }
    return null;
  };
  if (notEmpty(innerInstructions)) {
    if (!isOut) {
      const lastElement = innerInstructions
        .pop();
      if (typeof lastElement !== 'undefined'
      && lastElement.instructions.length) {
        const swapInRaw = lastElement.instructions.filter((ins: ParsedInstruction) => ins.parsed)
          .pop();
        const swapInIns: IInstruction | undefined = swapInRaw;
        return getParsedInfo(swapInIns);
      }
    }
    const swapOutIns: IInstruction = innerInstructions[
      innerInstructions.length - 1
    ]?.instructions.filter((ins: ParsedInstruction) => ins.parsed)[0];
    return getParsedInfo(swapOutIns);
  }
  return null;
};

const getSource = (txMsg: IMessage) => txMsg.instructions[0]?.parsed?.info?.source
?? txMsg.instructions[1]?.parsed?.info?.source;

const getDestination = (txMsg: IMessage) => txMsg.instructions.filter(
  (ins) => notEmpty(ins.parsed) && ins.parsed.type === 'transfer',
)[0]?.parsed?.info?.destination
  || txMsg.instructions[0]?.parsed?.info?.destination
  || txMsg.instructions[1]?.parsed?.info?.destination
  || txMsg.instructions[2]?.parsed?.info?.destination;

const getLamportsAmount = (txMsg: IMessage, metaFirstIns: IInstruction[]
| undefined) => txMsg.instructions[1]?.parsed?.info?.lamports
|| txMsg.instructions[0]?.parsed?.info?.lamports
|| (notEmpty(metaFirstIns) && metaFirstIns[0]?.parsed?.info?.lamports);

const getTokenAddress = (swap: IInsParsedInfo | null) => swap && (swap.destination || swap.mint);

const getType = (
  txMsg: IMessage,
  metaFirstIns: IInstruction[] | undefined,
  swapInfoOut: IToken | null | undefined,
  swapInfoIn: IToken | null | undefined,
  isSwap: boolean,
) => (swapInfoOut || swapInfoIn || isSwap
  ? 'swap'
  : txMsg.instructions[0]?.parsed?.type
      || txMsg.instructions[1]?.parsed?.type
      || (notEmpty(metaFirstIns) && metaFirstIns[0]?.parsed?.type)
      || 'transfer');

const getTransferType = (
  type: string,
  publicKey: PublicKey,
  source: string | undefined,
) => (((type === 'transfer'
  || type === 'createAccount'
  || type === 'createAccount'
  || type === 'create')
    && publicKey.toBase58() === source)
  || !source
  ? 'sent'
  : 'received');

const getTransferAmount = (
  postTokenBalances: TokenBalance[] | null | undefined,
  preTokenBalances: TokenBalance[] | null | undefined,
  publicKey: PublicKey,
) => (notEmpty(postTokenBalances) && postTokenBalances.filter(
  (bal) => bal.owner === publicKey.toBase58(),
)[0]?.uiTokenAmount?.uiAmount)
    || (notEmpty(preTokenBalances)
    && preTokenBalances.filter((bal) => bal.owner === publicKey.toBase58())[0]?.uiTokenAmount
      ?.uiAmount);

const getSwapType = (
  logMessages: string[] | null | undefined,
) => {
  if (notEmpty(logMessages)) {
    logMessages.forEach((msg, i) => {
      if (JSON.stringify(msg).includes('SetTokenLedger')
      || (i === 0 && JSON.stringify(msg).includes('Program JUP2'))) {
        return true;
      }
      return false;
    });
  }
  return false;
};

const mapTransaction = async (
  transaction: ISignatureWithData,
  txMeta: ParsedTransactionMeta | null,
  txMsg: IMessage,
  connection: Connection,
  publicKey: PublicKey,
) => {
  const { innerInstructions } = txMeta as {
    innerInstructions: ParsedInnerInstruction[] | null
  };
  const { logMessages } = txMeta as {
    logMessages: string[] | null | undefined
  };
  const { postTokenBalances } = txMeta as {
    postTokenBalances: TokenBalance[] | null | undefined
  };
  const { preTokenBalances } = txMeta as {
    preTokenBalances: TokenBalance[] | null | undefined
  };
  const [innerFirstIns] = innerInstructions ?? [];
  const { instructions: metaFirstIns } = innerFirstIns || {};

  const { fee } = txMeta as { fee: number | null };
  const source = getSource(txMsg);
  const destination = getDestination(txMsg);
  const lamportsAmount = getLamportsAmount(txMsg, metaFirstIns);
  const nftInfo = await getNftInfo(metaFirstIns, publicKey);
  const swapIn = getSwapInfo(innerInstructions, false);
  const swapOut = getSwapInfo(innerInstructions, true);
  const swapInfoIn: IToken | null | undefined = await
  getTokenInfo(getTokenAddress(swapIn), connection);
  const swapInfoOut: IToken | null | undefined = await
  getTokenInfo(getTokenAddress(swapOut), connection);
  const transferInfoIn: IToken | null | undefined = swapIn && await
  tokenListService.getTokenByAddress(swapIn.mint);
  const transferInfoOut: IToken | null | undefined = swapOut && await
  tokenListService.getTokenByAddress(swapOut.mint);
  const transferAmount = getTransferAmount(postTokenBalances, preTokenBalances, publicKey);
  const isSwap = getSwapType(logMessages);
  const type = getType(txMsg, metaFirstIns, swapInfoOut, swapInfoIn, isSwap);
  const transferType = getTransferType(type, publicKey, source);
  const error = Boolean(transaction.err);

  return {
    fee,
    type,
    transferType,
    lamportsAmount,
    nftInfo,
    source,
    destination,
    transferInfoIn,
    transferInfoOut,
    transferAmount,
    swapIn,
    swapOut,
    swapInfoIn,
    swapInfoOut,
    error,
  };
};

export {
  mapTransaction,
  notEmpty,
};
