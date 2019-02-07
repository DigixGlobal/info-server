const express = require('express');

const {
  getDaoServerNonce,
  setDaoServerNonce,
  incrementMaxValue,
} = require('../dbWrapper/counters');

const {
  addPendingKycApproval,
} = require('../dbWrapper/kyc');

const {
  getServerSignatures,
} = require('../helpers/utils');

const {
  counters,
} = require('../helpers/constants');

const router = express.Router();

router.post('/approve', async (req, res) => {
  const { retrievedSig, retrievedNonce, computedSig } = getServerSignatures(req);
  const currentDaoServerNonce = await getDaoServerNonce();

  if (
    (computedSig === retrievedSig)
    && (retrievedNonce > currentDaoServerNonce)
  ) {
    await setDaoServerNonce(parseInt(retrievedNonce, 10));
    const approval = req.body.payload;
    await addPendingKycApproval(approval);
    await incrementMaxValue(counters.KYC_APPROVALS, 1);
    res.status(200).json({ result: 'done' });
  } else {
    res.status(403).json({ result: 'unauthorized' });
  }
});

module.exports = router;
