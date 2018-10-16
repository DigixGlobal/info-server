const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  return res.json({ message: 'proposals/test' });
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
