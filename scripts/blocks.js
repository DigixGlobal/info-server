const {
  getCounter,
} = require('../dbWrapper/counters');

const {
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  processTransactions,
  updateTransactionsDatabase,
} = require('./transactions');

const {
  counters,
} = require('../helpers/constants');

const syncAndProcessToLatestBlock = async (watching = false) => {
  const lastProcessedBlock = (await getCounter(counters.TRANSACTIONS)).last_processed_block;
  await updateTransactionsDatabase(lastProcessedBlock, watching);
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
