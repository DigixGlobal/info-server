const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const addPendingKycApproval = async (approval) => {
  approval.status = 'pending';
  await mongoUtil.getDB()
    .collection(collections.KYC_APPROVALS)
    .insertOne(approval);
};

const getPendingKycApprovals = async (filter, limit = 10) => {
  const cursor = mongoUtil.getDB()
    .collection(collections.KYC_APPROVALS)
    .find(filter)
    .limit(limit);
  const pendingApprovals = [];
  for (let entry = await cursor.next(); entry != null; entry = await cursor.next()) {
    pendingApprovals.push(entry);
  }
  return pendingApprovals;
};

const setKycProcessed = async (id, txnId) => {
  await mongoUtil.getDB()
    .collection(collections.KYC_APPROVALS)
    .updateOne({ _id: id }, {
      $set: {
        status: 'processed',
        txhash: txnId,
      },
    });
};

const setKycSuccess = async (txhash) => {
  await mongoUtil.getDB()
    .collection(collections.KYC_APPROVALS)
    .updateMany({ txhash }, {
      $set: { status: 'success' },
    });

  // return the updated docs
  const cursor = mongoUtil.getDB()
    .collection(collections.KYC_APPROVALS)
    .find({ txhash });
  const updatedDocs = [];
  for (let entry = await cursor.next(); entry != null; entry = await cursor.next()) {
    if (entry && entry._id) delete entry._id;
    updatedDocs.push(entry);
  }
  return updatedDocs;
};

module.exports = {
  addPendingKycApproval,
  getPendingKycApprovals,
  setKycProcessed,
  setKycSuccess,
};
