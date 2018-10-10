const BigNumber = require('bignumber.js');

const {
  indexRange,
} = require('@digix/helpers/lib/helpers');

const {
  sumArrayBN,
} = require('../helpers/utils');

const {
  readProposalIndices,
  readProposalVersionIndices,
  daoConfigsKeys,
} = require('../helpers/constants');

const refreshProposalDetails = async (db, contracts, res) => {
  // this proposal has been changed in one way or another
  // we need to update its details in the database

  // might as well assume that we know nothing about the proposal
  // and get all the details for it
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    console.log('proposal = ', proposal);
    if (proposal === null) {
      proposal = {};
    }
    // readProposal
    const proposalDetails = await contracts.daoStorage.readProposal.call(res._proposalId);
    proposal.proposalId = proposalDetails[readProposalIndices.proposalId];
    proposal.proposer = proposalDetails[readProposalIndices.proposer];
    proposal.endorser = proposalDetails[readProposalIndices.endorser];
    proposal.stage = proposalDetails[readProposalIndices.stage];
    proposal.timeCreated = proposalDetails[readProposalIndices.timeCreated];
    proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];
    proposal.prl = proposalDetails[readProposalIndices.prl];
    proposal.isDigix = proposalDetails[readProposalIndices.isDigix];

    // readProposalVersion
    const nVersions = proposalDetails[readProposalIndices.nVersions];
    proposal.proposalVersions = [];
    let currentVersion = res._proposalId;
    for (const v in indexRange(0, nVersions)) {
      console.log('version id : ', v);
      const proposalVersion = await contracts.daoStorage.readProposalVersion.call(res._proposalId, currentVersion);
      let proposalDocs = [];
      if (proposalVersion === proposal.finalVersionIpfsDoc) {
        proposalDocs = await contracts.daoStorage.readProposalDocs.call(res._proposalId);
      }
      proposal.proposalVersions.push({
        docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
        created: proposalVersion[readProposalVersionIndices.created],
        milestoneFundings: proposalVersion[readProposalVersionIndices.milestoneFundings],
        finalReward: proposalVersion[readProposalVersionIndices.finalReward],
        moreDocs: proposalDocs,
        totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])),
      });
      currentVersion = await contracts.daoStorage.getNextProposalVersion.call(res._proposalId, currentVersion);
    }
    console.log('proposal : ', proposal);

    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalFinalizeProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    const proposalDetails = await contracts.daoStorage.readProposal.call(res._proposalId);
    proposal.stage = proposalDetails[readProposalIndices.stage];
    proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];

    const draftVotingPhase = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_VOTING_PHASE);
    proposal.draftVoting = {};
    proposal.draftVoting.startTime = await contracts.daoStorage.readProposalDraftVotingTime.call(res._proposalId);
    proposal.draftVoting.votingDeadline = proposal.draftVoting.startTime.plus(draftVotingPhase);
    proposal.draftVoting.totalVoterStake = new BigNumber(0);
    proposal.draftVoting.totalVoterCount = new BigNumber(0);
    proposal.draftVoting.currentResult = new BigNumber(0);
    proposal.draftVoting.quorum = new BigNumber(0);
    proposal.draftVoting.quota = new BigNumber(0);
    proposal.draftVoting.claimed = false;
    proposal.draftVoting.passed = false;
    proposal.draftVoting.funded = false;
    proposal.currentVotingRound = -1;
    proposal.votingStage = 'draftVoting'; // TODO: take from constants
    console.log('proposal: ', proposal);

    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalFinishMilestone = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  const proposal = proposals.findOne({ proposalId: res._proposalId });
};

const refreshProposalDraftVotingClaim = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  const proposal = proposals.findOne({ proposalId: res._proposalId });
};

const refreshProposalVotingClaim = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  const proposal = proposals.findOne({ proposalId: res._proposalId });
};

const refreshProposalCloseProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  const proposal = proposals.findOne({ proposalId: res._proposalId });

  proposal.stage = 'archive'; // TODO: take from constants

  // update the database
  proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
};

const refreshProposalPRLAction = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  const proposal = proposals.findOne({ proposalId: res._proposalId });

  proposal.prl = res._actionId; // TODO: take from constants
};

module.exports = {
  refreshProposalDetails,
  refreshProposalFinalizeProposal,
  refreshProposalFinishMilestone,
  refreshProposalDraftVotingClaim,
  refreshProposalVotingClaim,
  refreshProposalCloseProposal,
  refreshProposalPRLAction,
};
