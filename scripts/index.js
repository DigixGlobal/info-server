const {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const {
  processTransactions,
} = require('./transactions');

const {
  isDaoStarted,
  refreshDao,
  initDaoBeforeStart,
  refreshDaoConfigs,
  refreshDaoTemp,
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
  isDaoStarted,
  initDaoBeforeStart,
  refreshDaoTemp,
};
