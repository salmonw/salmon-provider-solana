import { PublicKey, Connection } from '@solana/web3.js';
import { decorateRecentTransactions } from './solana-recent-tx-decorator';
import { ISignature } from '../types/transfer';

const list = async (
  connection: Connection,
  signatures: ISignature[],
  publicKey: PublicKey,
  lastSignature: string,
) => {
  let empty: ISignature[] = [];
  if (lastSignature) {
    const lastIndex: number = signatures.findIndex((s) => s.signature === lastSignature);
    empty = signatures.slice(lastIndex + 1, lastIndex + 9);
  } else {
    empty = signatures.slice(0, 8);
  }

  let transactions = [];
  const signArray: string[] = empty.map((item) => item.signature);
  await Promise.resolve(
    (transactions = await connection.getParsedConfirmedTransactions(signArray, 'finalized')),
  );

  const updateArray = (s: ISignature, i: number) => {
    const sign = s;
    sign.data = transactions[i];
  };

  empty.forEach((s, i) => { updateArray(s, i); });

  return Promise.all(
    signatures
      .filter((s) => s.data)
      .map(async (transaction) => decorateRecentTransactions(transaction, connection, publicKey)),
  );
};

export { list };
