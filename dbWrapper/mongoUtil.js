const {
  MongoClient,
} = require('mongodb');

const {
  collections,
} = require('../helpers/constants');

const keystore = require('../keystore/kyc-admin.json');

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

const initToResyncDb = async () => {
  console.log('in initToResyncDb');
  await _db.collection(collections.COUNTERS).deleteOne({ name: 'allTransactions' });
};

const initToProcessOnlyDb = async () => {
  console.log('in initToProcessOnlyDb');
  // wipe everything except synced transactions
  await _emptyCollections([
    collections.ADDRESSES,
    collections.DAO_CONFIGS,
    collections.DAO,
    collections.KYC_APPROVALS,
    collections.PENDING_TRANSACTIONS,
    collections.PROPOSALS,
    collections.SPECIAL_PROPOSALS,
  ]);

  // update last_processed counter to 0 (to trigger reprocessing)
  await _db.collection(collections.COUNTERS).updateOne({
    name: 'allTransactions',
  }, {
    $set: {
      last_processed: 0,
      last_seen_block: 0,
      is_syncing: false,
      is_updating_latest_txns: false,
    },
  });

  console.log('cleared DB, except synced transactions. Will now start reprocessing');
};

const _emptyCollections = async (listOfCollections) => {
  for (const item of listOfCollections) {
    await _db.collection(item).deleteMany({});
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
  }
  await _db.dropDatabase();
  await _db.collection(collections.COUNTERS).insertOne({
    name: 'allTransactions',
    max_value: 0,
    last_processed: 0,
    last_seen_block: 0,
    last_processed_block: 0,
    is_syncing: false,
    is_updating_latest_txns: false,
  });
  await _db.createCollection(collections.KYC_APPROVALS);
  await _db.collection(collections.COUNTERS).insertOne({ name: 'nonce', daoServer: nonces.daoServer, self: nonces.self });
  await _db.collection(collections.COUNTERS).createIndex('name', { unique: true });
  await _db.collection(collections.DAO).createIndex('index');
  await _db.collection(collections.DAO_CONFIGS).createIndex('index');
  await _db.collection(collections.PROPOSALS).createIndex('proposalId', { unique: true });
  await _db.collection(collections.SPECIAL_PROPOSALS).createIndex('proposalId', { unique: true });
  await _db.collection(collections.ADDRESSES).createIndex('address', { unique: true });
  await _db.createCollection(collections.PENDING_TRANSACTIONS);
  await _db.collection(collections.TRANSACTIONS).createIndex('txhash', { unique: true });

  await _addAdmins();

  console.log('Initialized a fresh database');
};

const _addAdmins = async () => {
  // add KYC admin and forum admin to the addresses table
  // make sure they return valid json, so that they can be authenticated from DAO server
  const forumAdminAddress = process.env.FORUM_ADMIN_ADDRESS;
  await _db.collection(collections.ADDRESSES).insertMany([
    {
      address: '0x'.concat(keystore.address),
      isKycOfficer: true,
    },
    {
      address: forumAdminAddress,
      isForumAdmin: true,
    },
  ]);
};

module.exports = {
  connectToServer,
  getDB,
  initFreshDb,
  checkAndInitFreshDb,
  initToResyncDb,
  initToProcessOnlyDb,
};
