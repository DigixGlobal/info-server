const express = require('express');

const {
  getTransaction,
  getTransactions,
  getUserTransactions,
} = require('../dbWrapper/transactions');

const router = express.Router();

router.get('/test', async (req, res) => {
  return res.json({ message: 'transactions/test' });
});

router.get('/details/:txhash', async (req, res) => {
  const result = await getTransaction(req.params.txhash);
  return res.json({ result });
});

router.get('/status', async (req, res) => {
  const txHashes = req.query.txns;
  if (txHashes.length === 0) return res.json({});
  const transactions = await getTransactions({
    'tx.hash': {
      $in: txHashes,
    },
  });
  const result = transactions.map(function (txn) {
    return {
      txhash: txn.tx.hash,
      from: txn.tx.from,
      gasPrice: txn.tx.gasPrice,
      blockHash: txn.txReceipt.blockHash,
      blockNumber: txn.txReceipt.blockNumber,
      gasUsed: txn.txReceipt.gasUsed,
    };
  });
  return res.json({ result });
});

router.get('/users/:address', async (req, res) => {
  const { count, skip, newestFirst } = req.query;
  const { address } = req.params;
  const result = await getUserTransactions(
    address,
    parseInt(count, 10),
    parseInt(skip, 10),
    newestFirst,
  );
  return res.json({ result });
});

module.exports = router;
