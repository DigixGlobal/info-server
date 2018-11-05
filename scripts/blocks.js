const {
  getLastTransaction,
} = require('../dbWrapper/transactions');

const {
  processTransactions,
  updateTransactionsDatabase,
} = require('./transactions');

const syncAndProcessToLatestBlock = async (web3) => {
  const lastTxn = await getLastTransaction();
  await updateTransactionsDatabase(web3, lastTxn);
  await processTransactions(web3);
};

const watchNewBlocks = async (web3) => {
  // const lastTxn = await getLastTransaction();
  const filter = web3.eth.filter('latest');
  filter.watch(async () => {
    syncAndProcessToLatestBlock(web3);
    // const latestBlock = await web3.eth.getBlock(result);
    // const blockNumberToProcess = latestBlock.number - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);
    //
    // if (lastTxn && (lastTxn.tx.blockNumber >= blockNumberToProcess)) return;
    //
    // const newBlockToProcess = await web3.eth.getBlock(blockNumberToProcess);
    //
    // await filterAndInsertTxns(web3, newBlockToProcess.transactions);
  });
};

module.exports = {
  syncAndProcessToLatestBlock,
  watchNewBlocks,
};
