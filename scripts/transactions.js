const {
  indexRange,
} = require('@digix/helpers/lib/helpers');

const {
  getCounter,
  incrementMaxValue,
  incrementLastProcessed,
} = require('./counters');

const {
  watchedFunctionsList,
  collections,
  counters,
} = require('../helpers/constants');

const {
  watchedFunctionsMap,
} = require('./refreshProposal');

const getLastTransaction = async (db) => {
  const cursor = db.collection(collections.TRANSACTIONS).find().sort({ _id: -1 }).limit(1);
  const r = await cursor.next();
  return r;
};

const getTransactions = async (db, skip) => {
  const cursor = db.collection(collections.TRANSACTIONS).find().skip(skip);
  const transactions = [];
  for (let transaction = await cursor.next(); transaction != null; transaction = await cursor.next()) {
    transactions.push(transaction);
  }
  return transactions;
};

const insertTransactions = async (db, docs) => {
  await db.collection(collections.TRANSACTIONS).insertMany(docs);
  await incrementMaxValue(db, counters.TRANSACTIONS, docs.length);
};

const formTxnDocument = async (web3, db, contracts, txnIds) => {
  const r = await getCounter(db, counters.TRANSACTIONS);
  const transactions = [];
  let currentIndex = r.max_value;
  for (const txnId of txnIds) {
    const txn = web3.eth.getTransaction(txnId);
    const txnReceipt = web3.eth.getTransactionReceipt(txnId);

    // make sure transaction is valid, is to our contracts, and has been mined
    if (txn && (contracts.fromAddress[txn.to]) && (txnReceipt.status === '0x01')) {
      // decode the function args and logs
      const decodedInputs = contracts.decoder.decodeMethod(txn.input);
      const decodedEvents = contracts.decoder.decodeLogs(txnReceipt.logs);

      if (
        decodedInputs !== undefined
        && watchedFunctionsList.includes(decodedInputs.name)
      ) {
        transactions.push({
          index: currentIndex + 1,
          tx: txn,
          txReceipt: txnReceipt,
          decodedInputs,
          decodedEvents,
        });
        currentIndex++;
      }
    }
  }
  return transactions;
};

const filterAndInsertTxns = async (web3, db, contracts, txnIds) => {
  const transactions = await formTxnDocument(web3, db, contracts, txnIds);
  if (transactions.length > 0) {
    await insertTransactions(db, transactions);
  }
};

const updateTransactionsDatabase = async (web3, db, contracts, lastTxn) => {
  const startBlock = (lastTxn === null) ? process.env.START_BLOCK
    : (lastTxn.tx.blockNumber + 1);
  const endBlock = web3.eth.blockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);

  for (const blockNumber of indexRange(startBlock, endBlock + 1)) {
    const block = await web3.eth.getBlock(blockNumber);
    await filterAndInsertTxns(web3, db, contracts, block.transactions);
  }
};

const getProposalId = (transaction) => {
  for (const param of transaction.decodedInputs.params) {
    if (param.name === '_proposalId') {
      return param.value;
    }
  }
};

const formEventObj = (transaction) => {
  const res = {
    _from: transaction.tx.from,
    _proposalId: getProposalId(transaction),
  };
  for (const eventLog of transaction.decodedEvents) {
    for (const arg of eventLog.events) {
      res[arg.name] = arg.value;
    }
  }
  return res;
};

const processTransactions = async (web3, db, contracts) => {
  const counter = await getCounter(db, counters.TRANSACTIONS);
  if (counter.last_processed === counter.max_value) return;
  const transactions = await getTransactions(db, counter.last_processed);
  if (transactions.length <= 0) return;
  for (const transaction of transactions) {
    const res = formEventObj(transaction);
    await watchedFunctionsMap[transaction.decodedInputs.name](db, contracts, res);
  }
  await incrementLastProcessed(db, counters.TRANSACTIONS, transactions.length);
};

module.exports = {
  getLastTransaction,
  updateTransactionsDatabase,
  filterAndInsertTxns,
  processTransactions,
};
