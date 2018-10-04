require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const cron = require("node-cron");
const app = express();
const Web3 = require('web3');
const ERC20abi = require('./ERC20abi.json');

const w3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io"));

app.use(cors());

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

const test = async () => {

  const DGD = w3.eth.contract(ERC20abi);
  const dgd = DGD.at('0xe0b7927c4af23765cb51314a0e0521a9645f0e2a');
  console.log('Total supply = ', await dgd.totalSupply.call());
}

console.log('\ttest running test()');
test();

cron.schedule("1 * * * *", async () => {
  // schedule a script to run every min

  console.log('\tIn cron.schedule');
  console.log('Running a task every 1 min');

  await test();
});

const server = app.listen(3002, function () {
  console.log('Notification app running on port.', server.address().port);
});
