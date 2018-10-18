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
  insertTransactions,
} = require('../dbWrapper/transactions');

const {
  watchedFunctionsList,
  counters,
} = require('../helpers/constants');

const {
  getContracts,
} = require('../helpers/contracts');

const {
  watchedFunctionsMap,
} = require('./watchedFunctions');

const _getProposalId = (transaction) => {
  for (const param of transaction.decodedInputs.params) {
    if (param.name === '_proposalId') {
      return param.value;
    }
  }
};

const _formEventObj = (transaction) => {
  const res = {
    _from: transaction.tx.from,
    _proposalId: _getProposalId(transaction),
  };
  for (const eventLog of transaction.decodedEvents) {
    for (const arg of eventLog.events) {
      res[arg.name] = arg.value;
    }
  }
  return res;
};

const _formTxnDocument = async (web3, txnIds) => {
  const r = await getCounter(counters.TRANSACTIONS);
  const transactions = [];
  const contracts = getContracts();

  let currentIndex = r.max_value;
  for (const txnId of txnIds) {
    const transaction = {};
    transaction.tx = web3.eth.getTransaction(txnId);
    transaction.txReceipt = web3.eth.getTransactionReceipt(txnId);

    // make sure transaction is valid, is to our contracts, and has been mined
    if (transaction.tx && (contracts.fromAddress[transaction.tx.to]) && (transaction.txReceipt.status === '0x01')) {
      // decode the function args and logs
      transaction.decodedInputs = contracts.decoder.decodeMethod(transaction.tx.input);
      transaction.decodedEvents = contracts.decoder.decodeLogs(transaction.txReceipt.logs);

      if (
        transaction.decodedInputs !== undefined
        && watchedFunctionsList.includes(transaction.decodedInputs.name)
      ) {
        transaction.index = currentIndex + 1;
        transactions.push(transaction);
        currentIndex++;
      }
    }
  }
  return transactions;
};

const filterAndInsertTxns = async (web3, txnIds) => {
  const transactions = await _formTxnDocument(web3, txnIds);
  if (transactions.length > 0) {
    await insertTransactions(transactions);
    await incrementMaxValue(counters.TRANSACTIONS, transactions.length);
  }
};

const updateTransactionsDatabase = async (web3, lastTxn) => {
  const startBlock = (lastTxn === null) ? process.env.START_BLOCK
    : (lastTxn.tx.blockNumber + 1);
  const endBlock = web3.eth.blockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);

  for (const blockNumber of indexRange(startBlock, endBlock + 1)) {
    const block = await web3.eth.getBlock(blockNumber);
    await filterAndInsertTxns(web3, block.transactions);
  }
};

const processTransactions = async () => {
  const counter = await getCounter(counters.TRANSACTIONS);
  if (counter.last_processed === counter.max_value) return;
  const transactions = await getTransactions({}, counter.last_processed);
  if (transactions.length <= 0) return;
  for (const transaction of transactions) {
    const res = _formEventObj(transaction);
    await watchedFunctionsMap[transaction.decodedInputs.name](res);
  }
  await incrementLastProcessed(counters.TRANSACTIONS, transactions.length);
};

module.exports = {
  filterAndInsertTxns,
  updateTransactionsDatabase,
  processTransactions,
};
