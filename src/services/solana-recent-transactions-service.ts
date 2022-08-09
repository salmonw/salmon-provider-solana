import { decorateRecentTransactions } from './solana-recent-tx-decorator';

const list = async (connection, signatures, publicKey, lastSignature) => {
  if (!signatures) {
    signatures = await connection.getSignaturesForAddress(publicKey);
  }

  // lastSignature =
  //   '2m7H2yDF8rGXem6pCpF2XYxSFKpgtwCRKMGmp3rFqY7GFZvHQeGf6mQ2pgxXDH8d8BiF1iSZk8RQna2W3hBcDVyH';

  let empty = [];
  if (lastSignature) {
    signatures.map((s, i) => {
      if (s.signature == lastSignature) {
        empty = signatures.filter((s) => !s.data).slice(i + 1, i + 9);
      }
    });
  } else {
    empty = signatures.slice(0, 8);
  }

  let transactions = [];
  const signArray = empty.map((item) => item.signature);
  await Promise.resolve(
    (transactions = await connection.getParsedConfirmedTransactions(signArray, 'finalized'))
  );

  empty.map((s, i) => {
    s.data = transactions[i];
  });

  // console.log('signatures post', JSON.stringify(signatures[1], '', 4));
  // console.log('empty post', JSON.stringify(empty[1], '', 4));

  return await Promise.all(
    signatures
      .filter((s) => s.data)
      .map(async (transaction) => {
        return await decorateRecentTransactions(transaction, connection, publicKey);
      })
  );
};

export { list };
