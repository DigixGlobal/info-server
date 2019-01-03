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

const betterGetTransactionReceipt = async (web3, txhash) => {
  return new Promise(function (resolve, reject) {
    web3.eth.getTransactionReceipt(txhash, (error, data) => {
      if (error !== null) reject(error);
      else resolve(data);
    });
  });
};

const betterGetTransaction = async (web3, txhash) => {
  return new Promise(function (resolve, reject) {
    web3.eth.getTransaction(txhash, (error, data) => {
      if (error !== null) reject(error);
      else resolve(data);
    });
  });
};

router.post('/watch', async (req, res) => {
  console.log('\n\n\n');
  console.log('\t\tENTERED watch()');
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
    let txnsDone = 0;
    txns.forEach(function (txn) {
      web3.eth.getTransaction(txn, async (e1, transaction) => {
        if (e1 !== null) console.log(e1);
        console.log('\t\tGOT getTransaction, ', transaction.hash);
        if (transaction) {
          web3.eth.getTransactionReceipt(txn, async (e2, transactionReceipt) => {
            if (e2 !== null) console.log(e2);
            console.log('\t\tGOT getTransactionReceipt, ', transactionReceipt.transactionHash);
            if (transaction.blockNumber <= web3.eth.blockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10)) {
              // if mined BLOCK_CONFIRMATIONS blocks in the past
              console.log('\t\tCASE 1: if mined BLOCK_CONFIRMATIONS blocks in the past');
              result.confirmed.push(_formTransactionObj(transaction, transactionReceipt));
            } else {
              // if mined, but not BLOCK_CONFIRMATIONS blocks in the past
              console.log('\t\tCASE 2: if mined, but not BLOCK_CONFIRMATIONS blocks in the past');
              result.seen.push(_formTransactionObj(transaction, transactionReceipt));
              await insertPendingTransactions([_formPendingTxn(transaction)]);
            }
            txnsDone++;
            if (txnsDone === txns.length) {
              console.log('\n\n\n');
              res.status(200).send({ result });
            }
          });
        } else {
          // simply add to pendingTransactions
          console.log('\t\tCASE 3: txn not mined, simply add to pendingTransactions');
          await insertPendingTransactions([_formPendingTxn({ hash: txn })]);
        }
      });
    });
  } else {
    console.log('\n\n\n');
    res.status(403);
  }
});

const _formPendingTxn = (txn) => {
  return {
    txhash: txn.hash,
  };
};

const _formTransactionObj = (transaction, transactionReceipt) => {
  return {
    txhash: transaction.hash,
    from: transaction.from,
    gasPrice: transaction.gasPrice,
    blockHash: transactionReceipt.blockHash,
    blockNumber: transactionReceipt.blockNumber,
    gasUsed: transactionReceipt.gasUsed,
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
