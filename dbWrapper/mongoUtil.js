const {
  MongoClient,
} = require('mongodb');

const {
  collections,
} = require('../helpers/constants');

let _db;

const connectToServer = async (url, dbName) => {
  const client = await MongoClient.connect(
    url,
    { useNewUrlParser: true },
  );
  _db = client.db(dbName);
};

const getDB = () => {
  return _db;
};

const checkAndInitFreshDb = async () => {
  console.log('in checkAndInitFreshDb');
  const allTransactionsCounter = await _db.collection(collections.COUNTERS).findOne({ name: 'allTransactions' });
  if (!allTransactionsCounter) {
    console.log('Cannot find allTransactions counter, initializing a fresh DB');
    await initFreshDb();
  }
};

const initFreshDb = async () => {
  const nonces = {
    self: 0,
    daoServer: 0,
  };
  const oldNonce = await _db
    .collection(collections.COUNTERS)
    .findOne({ name: 'nonce' });
  if (oldNonce !== null) {
    nonces.self = oldNonce.self;
    nonces.daoServer = oldNonce.daoServer;
  }
  await _db.dropDatabase();
  await _db.collection(collections.COUNTERS).insertOne({
    name: 'allTransactions',
    max_value: 0,
    last_processed: 0,
    last_processed_block: 0,
  });
  await _db.createCollection(collections.KYC_APPROVALS);
  await _db.collection(collections.COUNTERS).insertOne({ name: 'nonce', daoServer: nonces.daoServer, self: nonces.self });
  await _db.collection(collections.COUNTERS).createIndex('name', { unique: true });
  await _db.collection(collections.DAO).createIndex('index');
  await _db.collection(collections.DAO_CONFIGS).createIndex('index');
  await _db.collection(collections.PROPOSALS).createIndex('proposalId', { unique: true });
  await _db.collection(collections.ADDRESSES).createIndex('address', { unique: true });
  await _db.createCollection(collections.PENDING_TRANSACTIONS);
  await _db.collection(collections.TRANSACTIONS).createIndex('txhash', { unique: true });
  console.log('Initialized a fresh database');
};

module.exports = {
  connectToServer,
  getDB,
  initFreshDb,
  checkAndInitFreshDb,
};
