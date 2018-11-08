const {
  getLastTransaction,
} = require('../dbWrapper/transactions');

const {
  processTransactions,
  updateTransactionsDatabase,
} = require('./transactions');

const syncAndProcessToLatestBlock = async (web3, watching = false) => {
  const lastTxn = await getLastTransaction();
  await updateTransactionsDatabase(web3, lastTxn, watching);
  await processTransactions(web3);
};

const watchNewBlocks = async (web3) => {
  const filter = web3.eth.filter('latest');
  filter.watch(async () => {
    syncAndProcessToLatestBlock(web3, true);
  });
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
