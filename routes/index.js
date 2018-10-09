const express = require('express');

const router = express.Router();

const proposalRoutes = require('./proposals');
// add other subroutes in different files

router.use('/proposals', proposalRoutes);

router.get('/daoInfo', async (req, res) => {
  const result = await req.db.get('daoInfo').findOne({});
  return res.status(500).json({ result });
});

router.get('/address/:address', async (req, res) => {
  const result = await req.db.get('addresses').findOne({ address: req.params.address });
  return res.status(500).json({ result: result || 'notFound' });
});

module.exports = router;
