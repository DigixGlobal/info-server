const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertTransactions = async (transactions) => {
  await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .insertMany(transactions);
};

const insertTransaction = async (transaction) => {
  await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .insertOne(transaction);
};

const insertPendingTransactions = async (pendingTransactions) => {
  await mongoUtil.getDB()
    .collection(collections.PENDING_TRANSACTIONS)
    .insertMany(pendingTransactions);
};

const removePendingTransactions = async (txHashes) => {
  await mongoUtil.getDB()
    .collection(collections.PENDING_TRANSACTIONS)
    .deleteMany({
      txhash: {
        $in: txHashes,
      },
    });
};

const isExistPendingTransaction = async (txhash) => {
  const txnCursor = mongoUtil.getDB()
    .collection(collections.PENDING_TRANSACTIONS)
    .find({ txhash })
    .limit(1);
  const isExist = await txnCursor.hasNext();
  return isExist;
};

const isExistTransaction = async (txhash) => {
  const txnCursor = mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .find({ 'tx.hash': txhash })
    .limit(1);
  const isExist = await txnCursor.hasNext();
  return isExist;
};

const getTransaction = async (txhash) => {
  const tx = await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .findOne({ 'tx.hash': txhash });
  if (tx && tx._id) delete tx._id;
  return tx;
};

const getTransactions = async (filter, skip = 0) => {
  const cursor = mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .find(filter)
    .skip(skip);
  const transactions = [];
  for (let txn = await cursor.next(); txn != null; txn = await cursor.next()) {
    if (txn && txn._id) delete txn._id;
    transactions.push(txn);
  }
  return transactions;
};

const getUserTransactions = async (address, count = 10, skip = 0, newestFirst = 'true') => {
  const cursor = mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .find({ 'tx.from': address })
    .sort({ index: (newestFirst === 'true') ? -1 : 1 })
    .skip(skip)
    .limit(count);
  const transactions = [];
  for (let txn = await cursor.next(); txn != null; txn = await cursor.next()) {
    if (txn && txn._id) delete txn._id;
    transactions.push(txn);
  }
  return transactions;
};

const getLastTransaction = async () => {
  const cursor = mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .find()
    .sort({ _id: -1 })
    .limit(1);
  const transaction = await cursor.next();
  if (transaction && transaction._id) delete transaction._id;
  return transaction;
};

module.exports = {
  insertTransaction,
  insertTransactions,
  insertPendingTransactions,
  removePendingTransactions,
  isExistPendingTransaction,
  isExistTransaction,
  getTransaction,
  getTransactions,
  getUserTransactions,
  getLastTransaction,
};
