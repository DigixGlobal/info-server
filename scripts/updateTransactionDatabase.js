const {
  incrementAndGetNextIndex,
} = require('./counters');

const {
  watchedFunctionsList,
  collections,
  counters,
} = require('../helpers/constants');

module.exports = async (web3, db, contracts, tnxId) => {
  const transaction = {};
  transaction.tx = await web3.eth.getTransaction(tnxId);
  transaction.txReceipt = await web3.eth.getTransactionReceipt(tnxId);

  // if not sending to our contracts, or reverted: no need to process
  if ((!contracts.fromAddress[transaction.tx.to])
      || (transaction.txReceipt.status !== '0x01')) {
    return;
  }

  // decode the function args and logs
  transaction.decodedInputs = contracts.decoder.decodeMethod(transaction.tx.input);
  transaction.decodedEvents = contracts.decoder.decodeLogs(transaction.txReceipt.logs);

  // if we are watching this function, then insert to collection allTransactions
  if (watchedFunctionsList.includes(transaction.decodedInputs.name)) {
    incrementAndGetNextIndex(db, counters.TRANSACTIONS, function (r) {
      db.get(collections.TRANSACTIONS).insert({
        index: r.max_value,
        tx: transaction.tx,
        txReceipt: transaction.txReceipt,
        decodedInputs: transaction.decodedInputs,
        decodedEvents: transaction.decodedEvents,
      });
    });
  }
};
