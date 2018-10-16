const a = require('awaiting');

const updateTransactionDatabase = require('./updateTransactionDatabase');

module.exports = (web3, db, contracts) => {
  const filter = web3.eth.filter('latest');
  filter.watch(async () => {
    const currentBlockNumber = web3.eth.blockNumber;
    const blockNumberToProcess = currentBlockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);
    const block = web3.eth.getBlock(blockNumberToProcess);
    await a.map(block.transactions, 20, async (tnxId) => {
      await updateTransactionDatabase(web3, db, contracts, tnxId);
    });
  });
};
