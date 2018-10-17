### Outline of `info-server` structure

* Save all transactions and Events that go to Dao contracts in a `allTransactions` database, in chronological order:
```
{
  index: <index of transaction, starting from 0>
  tx: {txObject}
  txReceipt: {txReceipt object}
  decodedInput:
  decodedEvents:
}
```

* There is a function `updateTransactionDatabase` that will update `allTransactions` to the latest block. This is what it should do:
  * get the last transaction from `allTransactions`, find out which block it is (lets say its `lastBlock`)
  * go through all the blocks from `lastBlock+1` to `currentBlock`, and add all the DAO transactions to `allTransactions`

* There is a `watchNewBlocks` that watches new blocks and call `updateTransactionDatabase`

* There is a variable `lastProcessedTransaction` that is initialized to be -1 (not processed anything yet)

* There is a function `processTransactions` that will process the new transactions since the `lastProcessedTransaction`, to be called after `watchNewBlocks` is done adding new tnxs
  * For each tnx, do a `processTnx(tnxObjectFromDb)`
