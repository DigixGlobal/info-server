const {
  syncToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const {
  processTransactions,
} = require('./transactions');

module.exports = {
  syncToLatestBlock,
  watchNewBlocks,
  processTransactions,
};
