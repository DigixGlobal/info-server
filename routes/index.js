const express = require('express');

const proposalRoutes = require('./proposals');
const transactionRoutes = require('./transactions');

const {
  notifyDaoServer,
} = require('../scripts/notifier');

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

router.get('/test_server', async (req, res) => {
  notifyDaoServer({
    method: 'GET',
    path: '/transactions/latest',
    body: {
      payload: 'testing test_server',
    },
  });
  return res.json({ result: 'sent request to dao server' });
});

router.get('/address/:address', async (req, res) => {
  const details = await getAddressDetails(req.params.address.toLowerCase());
  return res.json({ result: details || 'notFound' });
});

module.exports = router;
