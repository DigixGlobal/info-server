const {
  syncToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const processTransactions = require('./processTransactions');

module.exports = {
  syncToLatestBlock,
  watchNewBlocks,
  processTransactions,
};
