const express = require('express');

const {
  collections,
} = require('../helpers/constants');

const router = express.Router();

router.get('/test', async (req, res) => {
  return res.json({ message: 'proposals/test' });
});

router.get('/count', async (req, res) => {
  const cursor = req.db.collection(collections.PROPOSALS).find();
  const result = { all: await cursor.count() };
  for (let proposal = await cursor.next(); proposal != null; proposal = await cursor.next()) {
    if (!result[proposal.stage]) result[proposal.stage] = 0;
    result[proposal.stage] += 1;
  }
  return res.json({ result });
});

router.get('/details/:id', async (req, res) => {
  const details = await req.db.collection(collections.PROPOSALS).findOne({ proposalId: req.params.id });
  return res.json({ result: details || 'notFound' });
});

router.get('/:stage', async (req, res) => {
  const filter = (req.params.stage === 'all') ? {} : { stage: req.params.stage };
  const cursor = req.db.collection(collections.PROPOSALS).find(filter);
  const proposals = [];
  for (let proposal = await cursor.next(); proposal != null; proposal = await cursor.next()) {
    proposals.push(proposal);
  }
  return res.json({ result: proposals });
});

module.exports = router;
