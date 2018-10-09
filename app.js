require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const cron = require('node-cron');
const Web3 = require('web3');
const monk = require('monk');
const routes = require('./routes');

const app = express();
const scripts = require('./scripts');

const contracts = {};

const {
  getContracts,
} = require('./helpers/contracts');

const db = monk(process.env.DATABASE_URL, function (err) {
  if (err) {
    console.error('Db is not connected: ', err.message);
  }
});

const w3 = new Web3(new Web3.providers.HttpProvider(process.env.WEB3_HTTP_PROVIDER));

app.use(cors());

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// middleware to inject db object // not sure if is a good practice
app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use('/', routes);

// const testDao = async () => {
//   await getContracts(contracts, w3, process.env.NETWORK_ID);
//   console.log('current quarter         = ', await contracts.dao.currentQuarterIndex.call());
//   console.log('current time in quarter = ', await contracts.dao.currentTimeInQuarter.call());
//   console.log('eth funds in dao        = ', await contracts.daoFundingStorage.ethInDao.call());
// };

scripts.setDummyData(db);

const startContractWatchers = async () => {
  await getContracts(contracts, w3, process.env.NETWORK_ID);
  scripts.watchProposalEvents(db, contracts);
};
startContractWatchers();

cron.schedule('* * * * *', async () => {
  // schedule a script to run every min

  console.log('\tIn cron.schedule');
  console.log('Running a task every 1 min');

  scripts.refreshDao(db, contracts); // check if daoInfo object has changed
});

const server = app.listen(3002, function () {
  console.log('Notification app running on port.', server.address().port);
});
