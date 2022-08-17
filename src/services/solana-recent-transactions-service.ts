import { decorateRecentTransactions } from './solana-recent-tx-decorator';

const list = async (connection, signatures, publicKey, lastSignature) => {
  let empty = [];
  if (lastSignature) {
    const lastIndex = signatures.findIndex((s) => s.signature === lastSignature);
    empty = signatures.slice(lastIndex + 1, lastIndex + 9);
  } else {
    empty = signatures.slice(0, 8);
  }

  let transactions = [];
  const signArray = empty.map((item) => item.signature);
  await Promise.resolve(
    (transactions = await connection.getParsedConfirmedTransactions(signArray, 'finalized')),
  );

  empty.map((s, i) => {
    s.data = transactions[i];
  });

  return Promise.all(
    signatures
      .filter((s) => s.data)
      .map(async (transaction) => decorateRecentTransactions(transaction, connection, publicKey)),
  );
};

export { list };
