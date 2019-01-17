const {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const {
  processTransactions,
} = require('./transactions');

const {
  refreshDao,
  refreshDaoConfigs,
} = require('./dao');

const {
  processPendingKycs,
} = require('./kyc');

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
  processTransactions,
  refreshDao,
  refreshDaoConfigs,
  processPendingKycs,
};
