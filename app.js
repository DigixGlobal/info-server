const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Web3 = require('web3');
const mongodb = require('mongodb');

const routes = require('./routes');
const scripts = require('./scripts');

const {
  getContracts,
} = require('./helpers/contracts');

const {
  collections,
} = require('./helpers/constants');

const app = express();
const contracts = {};

const w3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER));

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', routes);
app.set('json spaces', 4);

let db;

const initDB = async () => {
  const client = await mongodb.MongoClient.connect(process.env.DB_URL);
  const clientdb = client.db(process.env.DIGIXDAO_DB_NAME);
  await clientdb.collection(collections.COUNTERS).createIndex('name', { unique: true });
  await clientdb.collection(collections.DAO).createIndex('index');
  await clientdb.collection(collections.PROPOSALS).createIndex('proposalId', { unique: true });
  await clientdb.collection(collections.ADDRESSES).createIndex('address', { unique: true });
  await clientdb.collection(collections.TRANSACTIONS).createIndex('index', { unique: true });
  return clientdb;
};

const initCron = async () => {
  cron.schedule('* * * * *', async () => {
    // schedule a script to run every min
    console.log('\tIn cron.schedule');

    // process the pending transactions
    scripts.processTransactions(w3, db, contracts);
  });
};

const init = async () => {
  db = await initDB();

  // middleware to inject db object // not sure if is a good practice
  app.use((req, res, next) => {
    req.db = db;
    next();
  });

  const networkId = await w3.version.network;
  await getContracts(contracts, w3, networkId);

  await scripts.syncToLatestBlock(w3, db, contracts);

  scripts.watchNewBlocks(w3, db, contracts);

  initCron();
};

init();

const server = app.listen(process.env.PORT, function () {
  console.log('Info server running on port.', server.address().port);
});
