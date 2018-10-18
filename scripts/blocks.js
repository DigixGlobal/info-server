const {
  getLastTransaction,
} = require('../dbWrapper/transactions');

const {
  filterAndInsertTxns,
  updateTransactionsDatabase,
} = require('./transactions');

const syncToLatestBlock = async (web3) => {
  const lastTxn = await getLastTransaction();
  await updateTransactionsDatabase(web3, lastTxn);
};

const watchNewBlocks = async (web3) => {
  const lastTxn = await getLastTransaction();
  const filter = web3.eth.filter('latest');
  filter.watch(async (err, result) => {
    const latestBlock = await web3.eth.getBlock(result);
    const latestBlockNumber = latestBlock.number - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);

    if (lastTxn && (lastTxn.tx.blockNumber >= latestBlockNumber)) return;

    await filterAndInsertTxns(web3, latestBlock.transactions);
  });
};

module.exports = {
  syncToLatestBlock,
  watchNewBlocks,
};
