const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Web3 = require('web3');

const mongoUtil = require('./dbWrapper/mongoUtil');

const {
  initContracts,
} = require('./helpers/contracts');

// TODO: this will go
const {
  collections,
} = require('./helpers/constants');

const routes = require('./routes');
const scripts = require('./scripts');

const app = express();

const w3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER));

app.use(cors());
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('json spaces', 4);

const initDB = async () => {
  await mongoUtil.connectToServer(process.env.DB_URL, process.env.DIGIXDAO_DB_NAME);
  const db = mongoUtil.getDB();

  // TODO: this should be done at the time of deployment
  await db.collection(collections.COUNTERS).createIndex('name', { unique: true });
  await db.collection(collections.DAO).createIndex('index');
  await db.collection(collections.PROPOSALS).createIndex('proposalId', { unique: true });
  await db.collection(collections.ADDRESSES).createIndex('address', { unique: true });
  await db.collection(collections.TRANSACTIONS).createIndex('index', { unique: true });
};

const initCron = async () => {
  cron.schedule('* * * * *', async () => {
    // schedule a script to run every min
    console.log('\tIn cron.schedule');

    // process the pending transactions
    scripts.processTransactions(w3);
  });
};

const init = async () => {
  await initDB();

  // TODO: no need to do this (ask @vu)
  // middleware to inject db object // not sure if is a good practice
  app.use((req, res, next) => {
    req.db = mongoUtil.getDB();
    next();
  });
  app.use('/', routes);

  const networkId = await w3.version.network;
  await initContracts(w3, networkId);

  await scripts.syncToLatestBlock(w3);

  scripts.watchNewBlocks(w3);

  initCron();
};

init();

const server = app.listen(process.env.PORT, function () {
  console.log('Info server running on port.', server.address().port);
});
