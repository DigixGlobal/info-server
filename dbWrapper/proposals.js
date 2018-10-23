const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertProposal = async (proposal) => {
  await mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .insertOne(proposal);
};

const updateProposal = async (proposalId, update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.PROPOSALS)
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
  return proposal;
};

const getProposals = async (filter) => {
  const proposals = [];
  const cursor = mongoUtil.getDB()
    .collection(collections.PROPOSALS)
    .find(filter);
  for (let proposal = await cursor.next(); proposal != null; proposal = await cursor.next()) {
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
  updateProposal,
  getProposalsCursor,
  getProposal,
  getProposals,
  getProposalsCount,
};
