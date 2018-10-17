const express = require('express');

const proposalRoutes = require('./proposals');

const {
  collections,
} = require('../helpers/constants');

const router = express.Router();

// add other subroutes in different files

router.use('/proposals', proposalRoutes);

router.get('/daoInfo', async (req, res) => {
  const result = await req.db.collection(collections.DAO).findOne({});
  return res.json({ result });
});

router.get('/address/:address', async (req, res) => {
  const result = await req.db.collection(collections.ADDRESSES).findOne({ address: req.params.address });
  return res.json({ result: result || 'notFound' });
});

module.exports = router;
