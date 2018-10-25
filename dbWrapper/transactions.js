const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertTransactions = async (transactions) => {
  await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .insertMany(transactions);
};

const getTransaction = async (txhash) => {
  const tx = await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .findOne({ 'tx.hash': txhash });
  return tx;
};

const getTransactions = async (filter, skip = 0) => {
  const cursor = mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .find(filter)
    .skip(skip);
  const transactions = [];
  for (let txn = await cursor.next(); txn != null; txn = await cursor.next()) {
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
  return transaction;
};

module.exports = {
  insertTransactions,
  getTransaction,
  getTransactions,
  getUserTransactions,
  getLastTransaction,
};
