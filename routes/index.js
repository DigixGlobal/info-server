const express = require('express');

const proposalRoutes = require('./proposals');
const transactionRoutes = require('./transactions');

const {
  getCounter,
} = require('../dbWrapper/counters');

const {
  getDaoInfo,
} = require('../dbWrapper/dao');

const {
  getAddressDetails,
  getAddressesDetails,
} = require('../dbWrapper/addresses');

const {
  deserializeDaoInfo,
  deserializeAddress,
  readConfig,
} = require('../helpers/utils');

const {
  counters,
} = require('../helpers/constants');

const router = express.Router();

router.use('/proposals', proposalRoutes);

router.use('/transactions', transactionRoutes);

router.get('/daoInfo', async (req, res) => {
  const info = deserializeDaoInfo(await getDaoInfo());
  return res.json({ result: info });
});

router.get('/address/:address', async (req, res) => {
  const details = deserializeAddress(await getAddressDetails(req.params.address.toLowerCase()));
  return res.json({ result: details || 'notFound' });
});

router.get('/points', async (req, res) => {
  const users = req.query.address;
  const details = await getAddressesDetails({
    address: { $in: users },
  });
  const filteredDetails = details.map(function (d) {
    return {
      address: d.address,
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
