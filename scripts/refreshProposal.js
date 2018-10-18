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
  collections,
} = require('../helpers/constants');

const {
  getAllAddresses,
} = require('./addresses');

// DONE
const refreshProposalNew = async (db, contracts, res) => {
  const proposal = {};
  const proposalDetails = await contracts.daoStorage.readProposal.call(res._proposalId);
  proposal.proposalId = proposalDetails[readProposalIndices.proposalId];
  proposal.proposer = proposalDetails[readProposalIndices.proposer];
  proposal.endorser = proposalDetails[readProposalIndices.endorser];
  proposal.stage = proposalStages.IDEA;
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
    proposal.proposalVersions.push({
      docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
      created: proposalVersion[readProposalVersionIndices.created],
      milestoneFundings: proposalVersion[readProposalVersionIndices.milestoneFundings],
      finalReward: proposalVersion[readProposalVersionIndices.finalReward],
      moreDocs: [],
      totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])),
    });
    currentVersion = await contracts.daoStorage.getNextProposalVersion.call(res._proposalId, currentVersion);
  }

  // update the database
  await db.collection(collections.PROPOSALS).insertOne(proposal);
  console.log('INSERTED refreshProposalNew');
};

// DONE
const refreshProposalDetails = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.collection('proposals');
  const proposal = await proposals.findOne({ proposalId: res._proposalId });
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

  // update the database
  await proposals.updateOne({ proposalId: res._proposalId }, { $set: proposal });
  console.log('INSERTED refreshProposalDetails');
};

// DONE
const refreshProposalEndorseProposal = async (db, contracts, res) => {
  const proposals = db.collection(collections.PROPOSALS);

  // update the database
  await proposals.updateOne({ proposalId: res._proposalId }, { $set: { endorser: res._from } });
  console.log('INSERTED refreshProposalEndorseProposal');
};

// DONE
const refreshProposalFinalizeProposal = async (db, contracts, res) => {
  // read current proposal from DB
  const proposals = db.collection(collections.PROPOSALS);
  const proposal = await proposals.findOne({ proposalId: res._proposalId });
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
  proposal.votingStage = proposalVotingStages.DRAFT;

  // update the database
  await proposals.updateOne({ proposalId: res._proposalId }, { $set: proposal });
  console.log('INSERTED refreshProposalFinalizeProposal');
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
  // update proposals
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, async function (err, proposal) {
    getAllAddresses(db, async (allAddresses) => {
      const draftVotingCount = await contracts.daoStorage.readDraftVotingCount.call(res._proposalId, allAddresses);
      const yesVoters = await contracts.daoStorage.readDraftVotingVotes.call(res._proposalId, allAddresses, true);
      const noVoters = await contracts.daoStorage.readDraftVotingVotes.call(res._proposalId, allAddresses, false);
      const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_NUMERATOR);
      const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_DENOMINATOR);
      proposal.draftVoting.totalVoterStake = draftVotingCount[0].plus(draftVotingCount[1]);
      proposal.draftVoting.totalVoterCount = yesVoters[1].plus(noVoters[1]);
      proposal.draftVoting.currentResult = draftVotingCount[0].idiv(draftVotingCount[0].plus(draftVotingCount[1]));
      proposal.quorum = await contracts.daoCalculatorService.minimumDraftQuorum.call(res._proposalId);
      console.log('quorum = ', proposal.quorum);
      proposal.quota = quotaNumerator.idiv(quotaDenominator);

      proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
    });
  });

  // update addresses
  const addresses = db.get('addresses');
  addresses.findOne({ address: res._from }, function (err, participant) {
    participant.votes[res._proposalId].draftVoting = {};
    participant.votes[res._proposalId].votingRound = {};
    participant.votes[res._proposalId].draftVoting.commit = true;
    participant.votes[res._proposalId].draftVoting.reveal = true;

    addresses.update({ address: res._from }, participant, { upsert: true });
  });
};

const refreshProposalCommitVote = async (db, contracts, res) => {
  // update proposals
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
    // update addresses
    const addresses = db.get('addresses');
    addresses.findOne({ address: res._from }, async function (err, participant) {
      const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR);
      const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR);
      const voterStake = await contracts.daoStakeStorage.lockedDGDStake.call(res._from);
      proposal.votingRounds[res._index].quorum = await contracts.daoCalculatorService.minimumVotingQuorum.call(res._proposalId, res._index);
      proposal.votingRounds[res._index].quota = quotaNumerator.idiv(quotaDenominator);
      if (participant.votes[res._proposalId].votingRounds[res._index].commit === false) {
        proposal.votingRounds[res._index].totalVoterStake = proposal.votingRounds[res._index].totalVoterStake.plus(voterStake);
        proposal.votingRounds[res._index].totalVoterCount = proposal.votingRounds[res._index].totalVoterCount.plus(new BigNumber(1));
      }
      proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });

      participant.votes[res._proposalId].votingRound[res._index].commit = true;
      addresses.update({ address: res._from }, participant, { upsert: true });
    });
  });
};

const refreshProposalRevealVote = async (db, contracts, res) => {
  // update proposals
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
    getAllAddresses(db, async (allAddresses) => {
      const votingCount = await contracts.daoStorage.readVotingCount.call(res._proposalId, res._index, allAddresses);
      const yesVoters = await contracts.daoStorage.readVotingRoundVotes.call(res._proposalId, res._index, allAddresses, true);
      const noVoters = await contracts.daoStorage.readVotingRoundVotes.call(res._proposalId, res._index, allAddresses, false);
      const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR);
      const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR);
      proposal.votingRounds[res._index].totalVoterStake = votingCount[0].plus(votingCount[1]);
      proposal.votingRounds[res._index].totalVoterCount = yesVoters[1].plus(noVoters[1]);
      proposal.votingRounds[res._index].currentResult = votingCount[0].idiv(votingCount[0].plus(votingCount[1]));
      proposal.votingRounds[res._index].quorum = await contracts.daoCalculatorService.minimumVotingQuorum.call(res._proposalId, res._index);
      proposal.votingRounds[res._index].quota = quotaNumerator.idiv(quotaDenominator);

      proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
    });
  });

  // update addresses
  const addresses = db.get('addresses');
  addresses.findOne({ address: res._from }, function (err, participant) {
    participant.votes[res._proposalId].votingRound[res._index].reveal = true;
    addresses.update({ address: res._from }, participant, { upsert: true });
  });
};

const refreshProposalCommitVoteOnSpecial = async (db, contracts, res) => {
  // update proposals
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
    // update addresses
    const addresses = db.get('addresses');
    addresses.findOne({ address: res._from }, async function (err, participant) {
      const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_NUMERATOR);
      const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_DENOMINATOR);
      const voterStake = await contracts.daoStakeStorage.lockedDGDStake.call(res._from);
      proposal.votingRounds[0].quorum = await contracts.daoCalculatorService.minimumVotingQuorumForSpecial.call();
      proposal.votingRounds[0].quota = quotaNumerator.idiv(quotaDenominator);
      if (participant.votes[res._proposalId].votingRounds[0].commit === false) {
        proposal.votingRounds[0].totalVoterStake = proposal.votingRounds[0].totalVoterStake.plus(voterStake);
        proposal.votingRounds[0].totalVoterCount = proposal.votingRounds[0].totalVoterCount.plus(new BigNumber(1));
      }
      proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });

      participant.votes[res._proposalId].votingRound = {};
      participant.votes[res._proposalId].votingRound[0].commit = true;
      addresses.update({ address: res._from }, participant, { upsert: true });
    });
  });
};

const refreshProposalRevealVoteOnSpecial = async (db, contracts, res) => {
  // update proposals
  const proposals = db.get('proposals');
  proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
    getAllAddresses(db, async (allAddresses) => {
      const votingCount = await contracts.daoSpecialStorage.readVotingCount.call(res._proposalId, allAddresses);
      const yesVoters = await contracts.daoSpecialStorage.readVotingVotes.call(res._proposalId, allAddresses, true);
      const noVoters = await contracts.daoSpecialStorage.readVotingVotes.call(res._proposalId, allAddresses, false);
      const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_NUMERATOR);
      const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_DENOMINATOR);
      proposal.votingRounds[0].totalVoterStake = votingCount[0].plus(votingCount[1]);
      proposal.votingRounds[0].totalVoterCount = yesVoters[1].plus(noVoters[1]);
      proposal.votingRounds[0].currentResult = votingCount[0].idiv(votingCount[0].plus(votingCount[1]));
      proposal.votingRounds[0].quorum = await contracts.daoCalculatorService.minimumVotingQuorumForSpecial.call();
      proposal.votingRounds[0].quota = quotaNumerator.idiv(quotaDenominator);

      proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
    });
  });

  // update addresses
  const addresses = db.get('addresses');
  addresses.findOne({ address: res._from }, function (err, participant) {
    participant.votes[res._proposalId].votingRound[0].reveal = true;
    addresses.update({ address: res._from }, participant, { upsert: true });
  });
};

const watchedFunctionsMap = {
  submitPreproposal: refreshProposalNew,
  modifyProposal: refreshProposalDetails,
  endorseProposal: refreshProposalEndorseProposal,
  finalizeProposal: refreshProposalFinalizeProposal,
  // voteOnDraft: refreshProposalDraftVote,
  // claimDraftVotingResult: refreshProposalDraftVotingClaim,
  // commitVoteOnProposal: refreshProposalCommitVote,
  // revealVoteOnProposal: refreshProposalRevealVote,
  // claimProposalVotingResult: refreshProposalVotingClaim,
  // commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  // revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
};

module.exports = {
  refreshProposalNew,
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
