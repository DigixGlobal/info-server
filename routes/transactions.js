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

const {
  getWeb3,
} = require('../web3Wrapper/web3Util');

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
  const transactions = await _getTransactions(txHashes);
  const result = _formTransactionsObj(transactions);
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
  const message = req.method + req.originalUrl + JSON.stringify(req.body.payload) + retrievedNonce;
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
    const { txns } = req.body.payload;
    const web3 = getWeb3();
    const result = { seen: [], confirmed: [] };
    for (const txn of txns) {
      const transaction = await web3.eth.getTransaction(txn);
      if (transaction !== null && transaction.blockNumber !== null) {
        if (transaction.blockNumber <= web3.eth.blockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10)) {
          // if mined BLOCK_CONFIRMATIONS blocks in the past
          result.confirmed.push(_formTransactionObj(transaction));
        } else {
          // if mined, but not BLOCK_CONFIRMATIONS blocks in the past
          result.seen.push(_formTransactionObj(transaction));
          await insertPendingTransactions([_formPendingTxn(transaction)]);
        }
      } else {
        // simply add to pendingTransactions
        await insertPendingTransactions([_formPendingTxn({ hash: txn })]);
      }
    }
    res.status(200).send({ result });
  } else {
    res.status(403);
  }
});

const _formPendingTxn = (txn) => {
  return {
    txhash: txn.hash,
  };
};

const _formTransactionObj = (transaction) => {
  return {
    txhash: transaction.hash,
    from: transaction.from,
    gasPrice: transaction.gasPrice,
    blockNumber: transaction.blockNumber,
  };
};

const _formTransactionsObj = (transactions) => {
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
  return result;
};

const _getTransactions = async (txns) => {
  const transactions = await getTransactions({
    'tx.hash': {
      $in: txns,
    },
  });
  return transactions;
};

module.exports = router;
