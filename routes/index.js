const express = require('express');

const proposalRoutes = require('./proposals');
const transactionRoutes = require('./transactions');
const kycRoutes = require('./kyc');

const {
  getCounter,
} = require('../dbWrapper/counters');

const {
  getDaoInfo,
  getDaoConfigs,
} = require('../dbWrapper/dao');

const {
  getAddressDetails,
  getAddressesDetails,
} = require('../dbWrapper/addresses');

const {
  deserializeDaoInfo,
  deserializeDaoConfigs,
  deserializeAddress,
  readConfig,
  getTxConfigs,
} = require('../helpers/utils');

const {
  counters,
} = require('../helpers/constants');

const router = express.Router();

router.use('/proposals', proposalRoutes);

router.use('/transactions', transactionRoutes);

router.use('/kyc', kycRoutes);

router.get('/daoInfo', async (req, res) => {
  const info = deserializeDaoInfo(await getDaoInfo());
  return res.json({ result: info });
});

router.get('/daoConfigs', async (req, res) => {
  const daoConfigs = deserializeDaoConfigs(await getDaoConfigs());
  return res.json({
    result: daoConfigs,
  });
});

router.get('/txConfigs', (req, res) => {
  return res.json({
    result: getTxConfigs(),
  });
});

router.get('/address/:address', async (req, res) => {
  const details = deserializeAddress(await getAddressDetails(req.params.address.toLowerCase()));
  return res.json({ result: details || 'notFound' });
});

router.get('/points', async (req, res) => {
  let users = req.query.address;
  console.log('users = ', users);
  if (!Array.isArray(users)) {
    users = new Array(users);
  }
  const details = await getAddressesDetails({
    address: { $in: users },
  });
  const filteredDetails = {};
  details.forEach(function (d) {
    filteredDetails[d.address] = {
      reputation: d.reputationPoint,
      quarterPoints: d.quarterPoint,
    };
  });
  return res.json({ result: filteredDetails });
});

router.get('/config', async (req, res) => {
  const config = readConfig();
  config.CURRENT_BLOCK_NUMBER = (await getCounter(counters.TRANSACTIONS)).last_processed_block;
  return res.json({ result: config });
});

module.exports = router;
