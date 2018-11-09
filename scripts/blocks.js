const {
  getLastTransaction,
} = require('../dbWrapper/transactions');

const {
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  processTransactions,
  updateTransactionsDatabase,
} = require('./transactions');

const syncAndProcessToLatestBlock = async (watching = false) => {
  const lastTxn = await getLastTransaction();
  await updateTransactionsDatabase(lastTxn, watching);
  await processTransactions();
};

const watchNewBlocks = async () => {
  const filter = getWeb3().eth.filter('latest');
  filter.watch(async () => {
    syncAndProcessToLatestBlock(true);
  });
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
