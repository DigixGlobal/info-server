const {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
} = require('./blocks');

const {
  processTransactions,
} = require('./transactions');

const {
  refreshDao,
} = require('./dao');

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
  processTransactions,
  refreshDao,
};
