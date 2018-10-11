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
  proposalStages,
  proposalVotingStages,
} = require('../helpers/constants');

const refreshProposalDetails = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    if (proposal === null) {
      proposal = {};
    }
    const proposalDetails = await contracts.daoStorage.readProposal.call(res._proposalId);
    proposal.proposalId = proposalDetails[readProposalIndices.proposalId];
    proposal.proposer = proposalDetails[readProposalIndices.proposer];
    proposal.endorser = proposalDetails[readProposalIndices.endorser];
    proposal.stage = proposalDetails[readProposalIndices.stage]; // TODO: map stage from the hex
    proposal.timeCreated = proposalDetails[readProposalIndices.timeCreated];
    proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];
    proposal.prl = proposalDetails[readProposalIndices.prl];
    proposal.isDigix = proposalDetails[readProposalIndices.isDigix];

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

    console.log('[refreshProposalDetails] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalEndorseProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.endorser = res._from;

    console.log('[refreshProposalEndorseProposal] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalFinalizeProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    const proposalDetails = await contracts.daoStorage.readProposal.call(res._proposalId);
    proposal.stage = proposalStages.DRAFT;
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

    console.log('[refreshProposalFinalizeProposal] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalDraftVotingClaim = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.draftVoting.claimed = true;
    proposal.draftVoting.passed = res._result;
    console.log('res = ', res);
    if (res._result === true) {
      proposal.stage = proposalStages.PROPOSAL;
      proposal.votingStage = proposalVotingStages.COMMIT;
      proposal.currentVotingRound = 0;
      proposal.votingRounds = [];
      const votingStartTime = await contracts.daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(0));
      const commitPhaseDuration = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_COMMIT_PHASE);
      const votingPhaseDuration = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_PHASE_TOTAL);
      proposal.votingRounds.push({
        startTime: votingStartTime,
        commitDeadline: votingStartTime.plus(commitPhaseDuration),
        revealDeadline: votingStartTime.plus(votingPhaseDuration),
        claimed: false,
        passed: false,
        funded: false,
      });
    } else {
      proposal.stage = proposalStages.ARCHIVED;
      proposal.votingStage = proposalVotingStages.NONE;
    }

    console.log('[refreshProposalDraftVotingClaim] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalVotingClaim = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.votingRounds[res._votingRound].claimed = true;
    proposal.votingRounds[res._votingRound].passed = res._result;
    proposal.votingStage = proposalVotingStages.NONE;
    proposal.stage = proposalStages.ARCHIVED;
    console.log('res = ', res);
    if (res._result === true) {
      proposal.stage = proposalStages.ONGOING;
      const milestoneFunding = await contracts.daoStorage.readProposalMilestone.call(res._proposalId, new BigNumber(res._votingRound));
      proposal.claimableFunding = proposal.claimableFunding.plus(milestoneFunding);
      const votingStartTime = await contracts.daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(res._votingRound));
      const configKey = res._votingRound === 0 ? daoConfigsKeys.CONFIG_VOTING_PHASE_TOTAL : daoConfigsKeys.CONFIG_INTERIM_PHASE_TOTAL;
      const votingPhaseDuration = await contracts.daoConfigsStorage.uintConfigs.call(configKey);
      proposal.currentMilestone = res._votingRound + 1;
      proposal.currentMilestoneStart = votingStartTime.plus(votingPhaseDuration);
    }

    console.log('[refreshProposalVotingClaim] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalClaimFunding = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    console.log('res = ', res);
    const fundingClaimed = new BigNumber(res._funding);
    proposal.claimableFunding = proposal.claimableFunding.minus(fundingClaimed);

    console.log('[refreshProposalClaimFunding] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalFinishMilestone = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.stage = proposalStages.REVIEW;
    proposal.votingStage = proposalVotingStages.COMMIT;
    proposal.currentVotingRound = res._milestoneIndex + 1;
    const votingStartTime = await contracts.daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(res._milestoneIndex + 1));
    const commitPhaseDuration = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_INTERIM_COMMIT_PHASE);
    const votingPhaseDuration = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_INTERIM_PHASE_TOTAL);
    proposal.votingRounds.push({
      startTime: votingStartTime,
      commitDeadline: votingStartTime.plus(commitPhaseDuration),
      revealDeadline: votingStartTime.plus(votingPhaseDuration),
      claimed: false,
      passed: false,
      funded: false,
    });

    console.log('[refreshProposalFinishMilestone] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalCloseProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.stage = proposalStages.ARCHIVED;
    proposal.votingStage = proposalVotingStages.NONE;

    console.log('[refreshProposalCloseProposal] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalPRLAction = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    proposal.prl = res._actionId; // TODO: take from constants
    if (res._actionId.toNumber() === 1) {
      proposal.stage = proposalStages.ARCHIVED;
      proposal.votingStage = proposalVotingStages.NONE;
    }

    console.log('[refreshProposalPRLAction] = ', proposal);
    // update the database
    proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
  });
};

const refreshProposalDraftVote = async (db, contracts, res) => {
  // TODO:
  console.log('[refreshProposalDraftVote]');
  console.log('res = ', res);
};

const refreshProposalCommitVote = async (db, contracts, res) => {
  // TODO:
  console.log('[refreshProposalCommitVote]');
  console.log('res = ', res);
};

const refreshProposalRevealVote = async (db, contracts, res) => {
  // TODO:
  console.log('[refreshProposalRevealVote]');
  console.log('res = ', res);
};

const refreshProposalCommitVoteOnSpecial = async (db, contracts, res) => {
  // TODO:
  console.log('[refreshProposalCommitVoteOnSpecial]');
  console.log('res = ', res);
};

const refreshProposalRevealVoteOnSpecial = async (db, contracts, res) => {
  // TODO:
  console.log('[refreshProposalRevealVoteOnSpecial]');
  console.log('res = ', res);
};

const watchedFunctionsMap = {
  voteOnDraft: refreshProposalDraftVote,
  commitVoteOnProposal: refreshProposalCommitVote,
  revealVoteOnProposal: refreshProposalRevealVote,
  commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
  endorseProposal: refreshProposalEndorseProposal,
};

module.exports = {
  refreshProposalDetails,
  refreshProposalFinalizeProposal,
  refreshProposalDraftVotingClaim,
  refreshProposalVotingClaim,
  refreshProposalClaimFunding,
  refreshProposalFinishMilestone,
  refreshProposalCloseProposal,
  refreshProposalPRLAction,
  watchedFunctionsMap,
};
