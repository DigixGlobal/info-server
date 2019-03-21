const {
  indexRange,
} = require('@digix/helpers/lib/helpers');

const {
  getCounter,
  setLastSeenBlock,
  setIsSyncing,
  setIsUpdatingLatestTxns,
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

const _updateLatestTxns = async (lastSeenBlock, latestBlockNumber) => {
  await setIsUpdatingLatestTxns(true);
  for (const blockNumber of indexRange(lastSeenBlock + 1, latestBlockNumber + 1)) {
    const block = await getWeb3().eth.getBlock(blockNumber);
    const watchedTxns = [];
    for (const txn of block.transactions) {
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
            blockNumber: block.number,
            transactions: watchedTxns,
          },
        },
      });
    }
  }
  await setLastSeenBlock(latestBlockNumber);
  await setIsUpdatingLatestTxns(false);
};

const watchNewBlocks = async () => {
  const counter = await getCounter(counters.TRANSACTIONS);
  const lastProcessedBlock = counter.last_processed_block;
  const lastSeenBlock = counter.last_seen_block;
  const isSyncing = counter.is_syncing;
  const isUpdatingLatestTxns = counter.is_updating_latest_txns;
  const latestBlock = getWeb3().eth.blockNumber;
  if (!isSyncing) syncAndProcessToLatestBlock(lastProcessedBlock);
  if (latestBlock > lastSeenBlock) {
    console.log('INFOLOG: [seen] new blocks = [', lastSeenBlock + 1, ', ', latestBlock, ']');
    if (!isUpdatingLatestTxns) _updateLatestTxns(lastSeenBlock, latestBlock);
  }
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
