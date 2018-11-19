const {
  indexRange,
} = require('@digix/helpers/lib/helpers');

const {
  getCounter,
  incrementMaxValue,
  incrementLastProcessed,
} = require('../dbWrapper/counters');

const {
  getTransactions,
  isExistPendingTransaction,
  insertTransactions,
} = require('../dbWrapper/transactions');

const {
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  notifyDaoServer,
} = require('./notifier');

const {
  watchedFunctionsList,
  counters,
} = require('../helpers/constants');

const {
  getContracts,
} = require('../helpers/contracts');

const {
  getFromFunctionArg,
} = require('../helpers/utils');

const {
  watchedFunctionsMap,
} = require('./watchedFunctions');

const _formEventObj = (transaction) => {
  const res = {
    _from: transaction.tx.from,
    _proposalId: getFromFunctionArg(transaction, '_proposalId'),
    _index: getFromFunctionArg(transaction, '_index'),
    _vote: getFromFunctionArg(transaction, '_vote'),
    _passed: getFromFunctionArg(transaction, '_passed'),
    _done: getFromFunctionArg(transaction, '_done'),
    _events: [],
  };
  for (const eventLog of transaction.decodedEvents) {
    // only consider the event if it from the contract we were watching
    if (eventLog && (eventLog.address === transaction.tx.to)) {
      // populate the `res` object for every argument in this event's log
      const _event = {};
      for (const arg of eventLog.events) {
        _event[arg.name] = arg.value;
      }
      res._events.push(_event);
    }
  }
  return res;
};

const _formTxnDocument = async (web3, txnIds) => {
  const r = await getCounter(counters.TRANSACTIONS);
  const transactions = [];
  const contracts = getContracts();

  let currentIndex = r.max_value;
  const otherWatchedTxns = [];
  for (const txnId of txnIds) {
    const transaction = {};
    transaction.tx = web3.eth.getTransaction(txnId);
    transaction.txReceipt = web3.eth.getTransactionReceipt(txnId);

    if (transaction.tx && (contracts.fromAddress[transaction.tx.to]) && (parseInt(transaction.txReceipt.status, 16) === 1)) {
      // decode the function args and logs
      transaction.decodedInputs = contracts.decoder.decodeMethod(transaction.tx.input);
      transaction.decodedEvents = contracts.decoder.decodeLogs(transaction.txReceipt.logs);

      if (
        transaction.decodedInputs !== undefined
        && watchedFunctionsList.includes(transaction.decodedInputs.name)
      ) { // if we are already watching this txn
        transaction.index = currentIndex + 1;
        transactions.push(transaction);
        currentIndex++;
      } else if (
        await isExistPendingTransaction(transaction.tx.hash)
      ) { // if this was in pending txn, but not a watched function
        otherWatchedTxns.push(transaction);
      }
    }
  }
  return {
    transactions,
    otherWatchedTxns,
  };
};

const checkAndNotify = async (transactions) => {
  const completedTxns = [];
  for (const txn of transactions) {
    if (await isExistPendingTransaction(txn.tx.hash)) {
      completedTxns.push({
        txhash: txn.tx.hash,
        from: txn.tx.from,
        gasPrice: txn.tx.gasPrice,
        blockHash: txn.txReceipt.blockHash,
        blockNumber: txn.txReceipt.blockNumber,
        gasUsed: txn.txReceipt.gasUsed,
      });
    }
  }
  if (completedTxns.length > 0) {
    notifyDaoServer({
      method: 'POST',
      path: '/transactions/confirmed',
      body: {
        payload: completedTxns,
      },
    });
  }
};

const filterAndInsertTxns = async (web3, txnIds) => {
  const filteredTxnObject = await _formTxnDocument(web3, txnIds);
  const { transactions, otherWatchedTxns } = filteredTxnObject;
  if (transactions.length > 0) {
    await insertTransactions(transactions);
    await incrementMaxValue(counters.TRANSACTIONS, transactions.length);
    await checkAndNotify(transactions.concat(otherWatchedTxns));
  }
};

const updateTransactionsDatabase = async (lastTxn, watching = false) => {
  const web3 = getWeb3();
  const startBlock = (lastTxn === null) ? process.env.START_BLOCK
    : (lastTxn.tx.blockNumber + 1);
  // use BLOCK_CONFIRMATIONS = 2 for testing
  const endBlock = web3.eth.blockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);
  if (startBlock > endBlock) return;

  for (const blockNumber of indexRange(startBlock, endBlock + 1)) {
    const block = await web3.eth.getBlock(blockNumber);
    await filterAndInsertTxns(web3, block.transactions);
    if (block.number % parseInt(process.env.SYNC_REPORT_FREQUENCY, 10) === 0) console.log(`\tSynced transactions to block ${block.number}/${endBlock}`);
  }

  if (watching) {
    const recentBlock = await web3.eth.getBlock(web3.eth.blockNumber);
    const watchedTxns = [];
    for (const txn of recentBlock.transactions) {
      if (await isExistPendingTransaction(txn)) {
        watchedTxns.push(txn);
      }
    }
    notifyDaoServer({
      method: 'POST',
      path: '/transactions/latest',
      body: {
        payload: {
          blockNumber: recentBlock.number,
          transactions: watchedTxns,
        },
      },
    });
  }
};

const processTransactions = async () => {
  const counter = await getCounter(counters.TRANSACTIONS);
  console.log(`\tProcessing transactions, last_processed = ${counter.last_processed}, max_value = ${counter.max_value}`);
  if (counter.last_processed === counter.max_value) return;
  const transactions = await getTransactions({}, counter.last_processed);
  if (transactions.length <= 0) return;
  for (const transaction of transactions) {
    const res = _formEventObj(transaction);
    await watchedFunctionsMap[transaction.decodedInputs.name](res);
  }
  await incrementLastProcessed(counters.TRANSACTIONS, transactions.length);
  console.log(`\tDone processing transactions until max_value = ${counter.max_value}`);
};

module.exports = {
  filterAndInsertTxns,
  updateTransactionsDatabase,
  processTransactions,
};
