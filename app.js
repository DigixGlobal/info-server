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

const {
  getContract,
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

const testDao = async () => {
  const { abi, address } = getContract('Dao', '42');
  console.log('current quarter         = ', await w3.eth.contract(abi).at(address).currentQuarterIndex.call());
  console.log('current time in quarter = ', await w3.eth.contract(abi).at(address).currentTimeInQuarter.call());
};

scripts.setDummyData(db);

cron.schedule('* * * * *', async () => {
  // schedule a script to run every min

  console.log('\tIn cron.schedule');
  console.log('Running a task every 1 min');

  await testDao();
});

const server = app.listen(3002, function () {
  console.log('Notification app running on port.', server.address().port);
});
