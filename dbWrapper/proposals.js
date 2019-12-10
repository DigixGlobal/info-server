const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertProposal = async (proposal) => {
  await mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .insertOne(proposal);
};

const insertSpecialProposal = async (proposal) => {
  await mongoUtil.getDB()
    .collection(collections.SPECIAL_PROPOSALS)
    .insertOne(proposal);
};

const updateProposal = async (proposalId, update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .updateOne({ proposalId }, update, moreOptions);
};

const updateSpecialProposal = async (proposalId, update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.SPECIAL_PROPOSALS)
    .updateOne({ proposalId }, update, moreOptions);
};

const getProposalsCursor = (filter) => {
  const cursor = mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .find(filter);
  return cursor;
};

const getProposal = async (proposalId) => {
  const proposal = await mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .findOne({ proposalId });
  if (proposal && proposal._id) delete proposal._id;
  return proposal;
};

const getSpecialProposal = async (proposalId) => {
  const proposal = await mongoUtil.getDB()
    .collection(collections.SPECIAL_PROPOSALS)
    .findOne({ proposalId });
  if (proposal && proposal._id) delete proposal._id;
  return proposal;
};

const getSpecialProposalsCount = async () => {
  const cursor = mongoUtil.getDB()
    .collection(collections.SPECIAL_PROPOSALS)
    .find({});
  const count = await cursor.count();
  return count;
};

const getProposals = async (filter) => {
  const proposals = [];
  const cursor = mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .find(filter);
  for (let proposal = await cursor.next(); proposal != null; proposal = await cursor.next()) {
    if (proposal && proposal._id) delete proposal._id;
    proposals.push(proposal);
  }
  return proposals;
};

const getSpecialProposals = async () => {
  const proposals = [];
  const cursor = mongoUtil.getDB()
    .collection(collections.SPECIAL_PROPOSALS)
    .find({});
  for (let proposal = await cursor.next(); proposal != null; proposal = await cursor.next()) {
    if (proposal && proposal._id) delete proposal._id;
    proposals.push(proposal);
  }
  return proposals;
};

const getProposalsCount = async (filter) => {
  const cursor = mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .find(filter);
  const count = await cursor.count();
  return count;
};

module.exports = {
  insertProposal,
  insertSpecialProposal,
  updateProposal,
  updateSpecialProposal,
  getProposalsCursor,
  getProposal,
  getSpecialProposal,
  getProposals,
  getSpecialProposals,
  getSpecialProposalsCount,
  getProposalsCount,
};
