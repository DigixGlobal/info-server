const {
  getLastTransaction,
  updateTransactionsDatabase,
  filterAndInsertTxns,
} = require('./transactions');

const syncToLatestBlock = async (web3, db, contracts) => {
  const lastTxn = await getLastTransaction(db);
  await updateTransactionsDatabase(web3, db, contracts, lastTxn);
};

const watchNewBlocks = async (web3, db, contracts) => {
  const lastTxn = await getLastTransaction(db);
  const filter = web3.eth.filter('latest');
  filter.watch(async (err, result) => {
    const latestBlock = await web3.eth.getBlock(result);
    const latestBlockNumber = latestBlock.number - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);

    if (lastTxn && (lastTxn.tx.blockNumber >= latestBlockNumber)) return;

    await filterAndInsertTxns(web3, db, contracts, latestBlock.transactions);
  });
};

module.exports = {
  syncToLatestBlock,
  watchNewBlocks,
};
