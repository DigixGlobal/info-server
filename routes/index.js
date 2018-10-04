const express = require('express');
const router = express.Router();

const proposalRoutes = require('./proposals');
// add other subroutes in different files

router.use('/proposals', proposalRoutes);


router.get('/test', async (req, res) => {
  return res.status(500).json({ success: true });
});


module.exports = router;
