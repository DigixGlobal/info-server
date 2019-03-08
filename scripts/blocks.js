const {
  getCounter,
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
} = require('../helpers/constants');


const syncAndProcessToLatestBlock = async () => {
  console.log('INFOLOG: syncAndProcessToLatestBlock');
  const lastProcessedBlock = (await getCounter(counters.TRANSACTIONS)).last_processed_block;
  await updateTransactionsDatabase(lastProcessedBlock);
  await processTransactions();
};

const updateLatestTxns = async () => {
  const recentBlock = await getWeb3().eth.getBlock(getWeb3().eth.blockNumber);
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
      path: '/transactions/seen',
      body: {
        payload: {
          blockNumber: recentBlock.number,
          transactions: watchedTxns,
        },
      },
    });
  }
};

const watchNewBlocks = async () => {
  const filter = getWeb3().eth.filter('latest');
  filter.watch(async (err, block) => {
    console.log('INFOLOG: got a new block from filter("latest"):', block);
    console.log('\tweb3.eth.blockNumber = ', getWeb3().eth.blockNumber);
    syncAndProcessToLatestBlock();
    updateLatestTxns();
  });
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
