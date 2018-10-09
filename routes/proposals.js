const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  return res.status(500).json({ message: 'proposals/test' });
});

router.get('/details/:id', async (req, res) => {
  // read straight from mongoDb database and return
  const details = await req.db.get('proposals').findOne({ proposalId: req.params.id })

  return res.status(500).json({ result: details ? details : 'notFound' });
});

router.get('/:stage', async (req, res) => {
  // read straight from mongoDb database and return
  const proposals = await req.db.get('proposals').find({ stage: req.params.stage })

  return res.status(500).json({ result: proposals });
});

module.exports = router;
