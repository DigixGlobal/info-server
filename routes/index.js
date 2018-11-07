const express = require('express');

const proposalRoutes = require('./proposals');
const transactionRoutes = require('./transactions');

const {
  getDaoInfo,
} = require('../dbWrapper/dao');

const {
  getAddressDetails,
} = require('../dbWrapper/addresses');

const router = express.Router();

router.use('/proposals', proposalRoutes);

router.use('/transactions', transactionRoutes);

router.get('/daoInfo', async (req, res) => {
  const info = await getDaoInfo();
  return res.json({ result: info });
});

router.get('/address/:address', async (req, res) => {
  const details = await getAddressDetails(req.params.address);
  return res.json({ result: details || 'notFound' });
});

module.exports = router;
