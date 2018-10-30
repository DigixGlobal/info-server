const express = require('express');
const crypto = require('crypto');

const {
  getTransaction,
  getTransactions,
  getUserTransactions,
  insertPendingTransactions,
} = require('../dbWrapper/transactions');

const {
  getDaoServerNonce,
  setDaoServerNonce,
} = require('../dbWrapper/counters');

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

router.post('/watch', async (req, res) => {
  const retrievedSig = req.headers['access-sign'];
  const retrievedNonce = parseInt(req.headers['access-nonce'], 10);
  const message = req.method + req.originalUrl + req.body.txns + retrievedNonce;
  const computedSig = crypto
    .createHmac('sha256', process.env.SERVER_SECRET)
    .update(message)
    .digest('hex');

  const currentDaoServerNonce = await getDaoServerNonce();

  if (
    (computedSig === retrievedSig)
    && (retrievedNonce > currentDaoServerNonce)
  ) {
    await setDaoServerNonce(parseInt(retrievedNonce, 10));
    const txns = req.body.txns.split(',').map(function (txn) {
      return {
        txhash: txn,
      };
    });
    if (txns.length > 0) await insertPendingTransactions(txns);
    res.send(200);
  } else {
    res.send(403);
  }
});

module.exports = router;
