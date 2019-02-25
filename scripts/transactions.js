const a = require('awaiting');

const {
  indexRange,
} = require('@digix/helpers/lib/helpers');

const {
  getCounter,
  incrementMaxValue,
  incrementLastProcessed,
  setLastProcessedBlock,
} = require('../dbWrapper/counters');

const {
  getTransactions,
  isExistPendingTransaction,
  insertTransaction,
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

const {
  updateKycApprovals,
} = require('./kyc');

const _formEventObj = (transaction) => {
  const res = {
    _from: transaction.tx.from,
    _proposalId: getFromFunctionArg(transaction, '_proposalId'),
    _index: getFromFunctionArg(transaction, '_index'),
    _vote: getFromFunctionArg(transaction, '_vote'),
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

const _formTxnDocument = async (web3, txns) => {
  const contracts = getContracts();

  const filteredTxns = [];
  const otherWatchedTxns = [];
  const failedTxns = [];
  for (const txn of txns) {
    const transaction = {};
    transaction.tx = txn;

    if (transaction.tx && (contracts.fromAddress[transaction.tx.to])) {
      transaction.txReceipt = await web3.eth.getTransactionReceipt(txn.hash);
      if (parseInt(transaction.txReceipt.status, 16) === 1) {
        // decode the function args and logs
        transaction.decodedInputs = contracts.decoder.decodeMethod(transaction.tx.input);
        transaction.decodedEvents = contracts.decoder.decodeLogs(transaction.txReceipt.logs);

        if (
          transaction.decodedInputs !== undefined
          && watchedFunctionsList.includes(transaction.decodedInputs.name)
        ) { // if we are already watching this txn
          transaction.txhash = txn.hash;
          filteredTxns.push(transaction);
        } else if (
          transaction.decodedInputs
          && transaction.decodedInputs.name === 'updateKyc'
        ) {
          await updateKycApprovals(transaction.tx.hash);
        } else if (
          await isExistPendingTransaction(transaction.tx.hash)
        ) { // if this was in pending txn, but not a watched function
          otherWatchedTxns.push(transaction);
        }
      } else {
        failedTxns.push(transaction);
      }
    }
  }
  return {
    filteredTxns,
    otherWatchedTxns,
    failedTxns,
  };
};

const checkAndNotify = async (transactions, failedTransactions) => {
  const completedTxns = [];
  const failedTxns = [];
  for (const txn of transactions) {
    if (await isExistPendingTransaction(txn.tx.hash)) {
      completedTxns.push({
        txhash: txn.tx.hash,
        from: txn.tx.from,
        gasPrice: txn.tx.gasPrice,
        blockHash: txn.txReceipt.blockHash,
        blockNumber: txn.txReceipt.blockNumber,
        gasUsed: txn.txReceipt.gasUsed,
        status: 1,
      });
    }
  }
  for (const txn of failedTransactions) {
    if (await isExistPendingTransaction(txn.tx.hash)) {
      failedTxns.push({
        txhash: txn.tx.hash,
        from: txn.tx.from,
        gasPrice: txn.tx.gasPrice,
        blockHash: txn.txReceipt.blockHash,
        blockNumber: txn.txReceipt.blockNumber,
        gasUsed: txn.txReceipt.gasUsed,
        status: 0,
      });
    }
  }
  if (completedTxns.length > 0 || failedTxns.length > 0) {
    notifyDaoServer({
      method: 'PUT',
      path: '/transactions/confirmed',
      body: {
        payload: {
          success: completedTxns,
          failed: failedTxns,
        },
      },
    });
  }
};

const filterAndInsertTxns = async (web3, txns) => {
  const filteredTxnObject = await _formTxnDocument(web3, txns);
  const { filteredTxns, otherWatchedTxns, failedTxns } = filteredTxnObject;
  console.log(`INFOLOG: got ${filteredTxns.length} filteredTxns, ${otherWatchedTxns.length} otherWatchedTxns, ${failedTxns.length} failedTxns,`);
  if (filteredTxns.length > 0) {
    for (const entry of filteredTxns) {
      try {
        await insertTransaction(entry);
        await incrementMaxValue(counters.TRANSACTIONS, 1);
      } catch (e) {
        console.log('\n\nERROR = ', e, '\n\n');
      }
    }
  }

  if (otherWatchedTxns.length > 0 || failedTxns.length > 0) {
    console.log('INFOLOG: calling checkAndNotify');
    await checkAndNotify(otherWatchedTxns, failedTxns);
  }
};

const fetchBlock = async (blockNumber) => {
  return new Promise(function (resolve, reject) {
    getWeb3().eth.getBlock(blockNumber, true, (e, block) => {
      if (e !== null) reject(e);
      else resolve(block);
    });
  });
};

// - Update our transaction database, given that our database has been updated to lastProcessedBlock
// - Save all the relevant transactions from block lastProcessedBlock + 1, to the lastest block (subject to BLOCK_CONFIRMATIONS requirement)
const updateTransactionsDatabase = async (lastProcessedBlock) => {
  const web3 = getWeb3();
  const startBlock = (lastProcessedBlock === 0) ? parseInt(process.env.START_BLOCK, 10)
    : (lastProcessedBlock + 1);
  const endBlock = (web3.eth.blockNumber + 1) - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);

  const blocksInBucket = parseInt(process.env.N_BLOCKS_BUCKET, 10);
  const blocksConcurrent = parseInt(process.env.N_BLOCKS_CONCURRENT, 10);

  if (startBlock > endBlock) return;

  const totalSteps = Math.floor((endBlock - startBlock - 1) / blocksInBucket) + 1;
  const blocksMap = new Map();
  for (const step of indexRange(0, totalSteps)) {
    const tempStartBlock = startBlock + (step * blocksInBucket);
    const tempEndBlock = (tempStartBlock + blocksInBucket) > endBlock ? endBlock : (tempStartBlock + blocksInBucket);
    blocksMap.clear();
    await a.map(indexRange(tempStartBlock, tempEndBlock), blocksConcurrent, async (blockNumber) => {
      const block = await fetchBlock(blockNumber);
      blocksMap.set(blockNumber, block);
    });
    for (const blockNumber of indexRange(tempStartBlock, tempEndBlock)) {
      const block = blocksMap.get(blockNumber);
      await filterAndInsertTxns(web3, block.transactions);
      await setLastProcessedBlock(blockNumber);
      if (block.number % parseInt(process.env.SYNC_REPORT_FREQUENCY, 10) === 0) {
        console.log(`\tSynced transactions to block ${block.number}/${endBlock}`);
      }
    }
  }
};

const processTransactions = async () => {
  const counter = await getCounter(counters.TRANSACTIONS);
  console.log(`\tProcessing transactions, last_processed = ${counter.last_processed}, max_value = ${counter.max_value}`);
  if (counter.last_processed >= counter.max_value) return;
  const transactions = await getTransactions({}, counter.last_processed);
  if (transactions.length <= 0) return;
  for (const transaction of transactions) {
    const res = _formEventObj(transaction);
    await incrementLastProcessed(counters.TRANSACTIONS, 1);
    try {
      await watchedFunctionsMap[transaction.decodedInputs.name](res, transaction.tx.blockNumber);
    } catch (e) {
      console.log('\n\nERROR (processTransactions) = ', e, '\n\n');
    }
  }
  console.log(`\tDone processing transactions until max_value = ${counter.max_value}`);
};

module.exports = {
  updateTransactionsDatabase,
  processTransactions,
};
