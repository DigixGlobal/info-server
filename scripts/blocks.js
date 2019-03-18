const {
  getCounter,
  setLastSeenBlock,
  setIsSyncing,
} = require('../dbWrapper/counters');

const {
  isExistPendingTransaction,
} = require('../dbWrapper/transactions');

const {
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  processTransactions,
  updateTransactionsDatabase,
} = require('./transactions');

const {
  notifyDaoServer,
} = require('./notifier');

const {
  counters,
  daoServerEndpoints,
} = require('../helpers/constants');

const syncAndProcessToLatestBlock = async (lastProcessedBlock = null) => {
  console.log('INFOLOG: syncAndProcessToLatestBlock');
  await setIsSyncing(true);
  if (lastProcessedBlock === null) lastProcessedBlock = (await getCounter(counters.TRANSACTIONS)).last_processed_block;
  await updateTransactionsDatabase(lastProcessedBlock);
  await processTransactions();
  await setIsSyncing(false);
};

const updateLatestTxns = async (latestBlockNumber) => {
  const recentBlock = await getWeb3().eth.getBlock(latestBlockNumber);
  const watchedTxns = [];
  for (const txn of recentBlock.transactions) {
    if (await isExistPendingTransaction(txn)) {
      watchedTxns.push({
        txhash: txn,
      });
    }
  }
  if (watchedTxns.length > 0) {
    notifyDaoServer({
      method: 'PUT',
      path: daoServerEndpoints.TRANSACTION_SEEN,
      body: {
        payload: {
          blockNumber: recentBlock.number,
          transactions: watchedTxns,
        },
      },
    });
  }
  await setLastSeenBlock(latestBlockNumber);
};

const watchNewBlocks = async () => {
  const counter = await getCounter(counters.TRANSACTIONS);
  const lastProcessedBlock = counter.last_processed_block;
  const lastSeenBlock = counter.last_seen_block;
  const isSyncing = counter.is_syncing;
  const latestBlock = getWeb3().eth.blockNumber;
  if (!isSyncing) syncAndProcessToLatestBlock(lastProcessedBlock);
  if (latestBlock > lastSeenBlock) {
    console.log('INFOLOG: got a new block = ', latestBlock);
    updateLatestTxns(latestBlock);
  }
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
