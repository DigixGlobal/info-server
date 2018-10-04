const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  return res.status(500).json({ message: 'proposals/test' });
});

router.get('/details/:id', async (req, res) => {
  // read straight from mongoDb database and return
  return res.status(500).json({ message: 'proposals/details/test' });
});

module.exports = router;
