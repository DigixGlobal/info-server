const {
  syncToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const {
  processTransactions,
} = require('./transactions');

const {
  refreshDao,
} = require('./dao');

module.exports = {
  syncToLatestBlock,
  watchNewBlocks,
  processTransactions,
  refreshDao,
};
