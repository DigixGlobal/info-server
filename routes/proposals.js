const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  return res.json({ message: 'proposals/test' });
});

router.get('/count', async (req, res) => {
  const allProposals = await req.db.get('proposals').find();
  const result = {}
  for (proposal of allProposals) {
    const stage = proposal.stage;
    if (!result[stage]) result[stage] = 0;
    result[stage] += 1;
  }
  return res.json({ result });
});

router.get('/details/:id', async (req, res) => {
  // read straight from mongoDb database and return
  const details = await req.db.get('proposals').findOne({ proposalId: req.params.id })

  return res.json({ result: details ? details : 'notFound' });
});

router.get('/:stage', async (req, res) => {
  // read straight from mongoDb database and return
  const filter = req.params.stage === 'all' ? {} : { stage: req.params.stage }
  const proposals = await req.db.get('proposals').find(filter);

  return res.json({ result: proposals });
});

module.exports = router;
