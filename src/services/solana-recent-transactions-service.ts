import { decorateRecentTransactions } from './solana-recent-tx-decorator';

const list = async (connection, signatures, publicKey, lastSignature) => {
  let empty = [];
  if (lastSignature) {
    signatures.map((s, i) => {
      if (s.signature === lastSignature) {
        empty = signatures.filter((s) => !s.data).slice(i + 1, i + 9);
      }
    });
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

  // console.log('signatures post', JSON.stringify(signatures[1], '', 4));
  // console.log('empty post', JSON.stringify(empty[1], '', 4));

  return Promise.all(
    signatures
      .filter((s) => s.data)
      .map(async (transaction) => decorateRecentTransactions(transaction, connection, publicKey)),
  );
};

export { list };
