const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  return res.status(500).json({ success: true });
});
module.exports = router;
