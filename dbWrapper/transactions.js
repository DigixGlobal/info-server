const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertTransactions = async (transactions) => {
  await mongoUtil.getDB()
    .collection(collections.TRANSACTIONS)
    .insertMany(transactions);
};

const getTransactions = async (filter, skip) => {
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
  getTransactions,
  getLastTransaction,
};
