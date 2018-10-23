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

const {
  getContracts,
} = require('../helpers/contracts');

const {
  getProposal,
  insertProposal,
  updateProposal,
} = require('../dbWrapper/proposals');

const {
  getAddressDetails,
  updateAddress,
} = require('../dbWrapper/addresses');

// TODO: move to a generic function
// get the `value` of a `key`
const _getProposalId = (res) => {
  let user;
  for (const event of res._events) {
    for (const argName in event) {
      if (argName === '_proposalId') {
        user = event[argName];
      }
    }
  }
  return user;
};

// TODO: move to a generic function
// get the `value` of a `key`
const _getResult = (res) => {
  let result;
  for (const event of res._events) {
    for (const argName in event) {
      if (argName === '_result') {
        result = event[argName];
      }
    }
  }
  return result;
};

// DONE
const refreshProposalNew = async (res) => {
  const proposal = {};
  const _proposalId = _getProposalId(res);
  const proposalDetails = await getContracts().daoStorage.readProposal.call(_proposalId);
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
  let currentVersion = _proposalId;
  for (const v in indexRange(0, nVersions)) {
    console.log('version id : ', v);
    const proposalVersion = await getContracts().daoStorage.readProposalVersion.call(_proposalId, currentVersion);
    proposal.proposalVersions.push({
      docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
      created: proposalVersion[readProposalVersionIndices.created],
      milestoneFundings: proposalVersion[readProposalVersionIndices.milestoneFundings],
      finalReward: proposalVersion[readProposalVersionIndices.finalReward],
      moreDocs: [],
      totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])),
    });
    currentVersion = await getContracts().daoStorage.getNextProposalVersion.call(_proposalId, currentVersion);
  }

  // update the database
  await insertProposal(proposal);
  console.log('INSERTED refreshProposalNew');
};

// DONE
const refreshProposalDetails = async (res) => {
  // read current proposal from DB
  const proposal = await getProposal(res._proposalId);
  const proposalDetails = await getContracts().daoStorage.readProposal.call(res._proposalId);
  proposal.proposalId = proposalDetails[readProposalIndices.proposalId];
  proposal.proposer = proposalDetails[readProposalIndices.proposer];
  proposal.endorser = proposalDetails[readProposalIndices.endorser];
  proposal.timeCreated = proposalDetails[readProposalIndices.timeCreated];
  proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];
  proposal.prl = proposalDetails[readProposalIndices.prl];
  proposal.isDigix = proposalDetails[readProposalIndices.isDigix];

  const nVersions = proposalDetails[readProposalIndices.nVersions];
  proposal.proposalVersions = [];
  let currentVersion = res._proposalId;
  for (const v in indexRange(0, nVersions)) {
    console.log('version id : ', v);
    const proposalVersion = await getContracts().daoStorage.readProposalVersion.call(res._proposalId, currentVersion);
    let proposalDocs = [];
    if (proposalVersion === proposal.finalVersionIpfsDoc) {
      proposalDocs = await getContracts().daoStorage.readProposalDocs.call(res._proposalId);
    }
    proposal.proposalVersions.push({
      docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
      created: proposalVersion[readProposalVersionIndices.created],
      milestoneFundings: proposalVersion[readProposalVersionIndices.milestoneFundings],
      finalReward: proposalVersion[readProposalVersionIndices.finalReward],
      moreDocs: proposalDocs,
      totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])),
    });
    currentVersion = await getContracts().daoStorage.getNextProposalVersion.call(res._proposalId, currentVersion);
  }

  // update the database
  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalDetails');
};

// DONE
const refreshProposalEndorseProposal = async (res) => {
  // update the database
  await updateProposal(res._proposalId, { $set: { endorser: res._from } });
  console.log('INSERTED refreshProposalEndorseProposal');
};

// DONE
const refreshProposalFinalizeProposal = async (res) => {
  // read current proposal from DB
  const proposal = await getProposal(res._proposalId);
  const proposalDetails = await getContracts().daoStorage.readProposal.call(res._proposalId);
  proposal.stage = proposalStages.DRAFT;
  proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];

  const draftVotingPhase = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_VOTING_PHASE)).toNumber();
  const draftQuotaNumerator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_NUMERATOR)).toNumber();
  const draftQuotaDenominator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_DENOMINATOR)).toNumber();
  proposal.draftVoting = {};
  proposal.draftVoting.startTime = (await getContracts().daoStorage.readProposalDraftVotingTime.call(res._proposalId)).toNumber();
  proposal.draftVoting.votingDeadline = proposal.draftVoting.startTime + draftVotingPhase;
  proposal.draftVoting.totalVoterStake = 0;
  proposal.draftVoting.totalVoterCount = 0;
  proposal.draftVoting.currentResult = 0;
  proposal.draftVoting.quorum = (await getContracts().daoCalculatorService.minimumDraftQuorum.call(res._proposalId)).toNumber();
  proposal.draftVoting.quota = (draftQuotaNumerator * 100) / draftQuotaDenominator;
  proposal.draftVoting.claimed = false;
  proposal.draftVoting.passed = false;
  proposal.draftVoting.funded = false;
  proposal.currentVotingRound = -1;
  proposal.votingStage = proposalVotingStages.DRAFT;

  // update the database
  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalFinalizeProposal');
};

// DONE
const refreshProposalDraftVote = async (res) => {
  // get info
  const addressDetails = await getAddressDetails(res._from);
  const proposal = await getProposal(res._proposalId);
  const vote = res._vote;
  const currentYes = proposal.draftVoting.currentResult * proposal.draftVoting.totalVoterStake;

  const { votes } = addressDetails;
  votes[res._proposalId] = {
    draftVoting: { vote },
  };

  // calculate which parts to update
  if (addressDetails.votes[res._proposalId] === undefined) {
    const totalVoterCount = proposal.draftVoting.totalVoterCount + 1;
    const totalVoterStake = proposal.draftVoting.totalVoterStake + addressDetails.lockedDgdStake;
    let currentResult;
    if (vote === true) {
      currentResult = (currentYes + addressDetails.lockedDgdStake) / totalVoterStake;
    } else {
      currentResult = currentYes / totalVoterStake;
    }
    proposal.draftVoting.totalVoterCount = totalVoterCount;
    proposal.draftVoting.totalVoterStake = totalVoterStake;
    proposal.draftVoting.currentResult = currentResult;
  } else {
    const previousVote = addressDetails.votes[res._proposalId].draftVoting.vote;
    let { currentResult } = proposal.draftVoting;
    if (previousVote === true && vote === false) {
      currentResult = (currentYes - addressDetails.lockedDgdStake) / proposal.draftVoting.totalVoterStake;
    } else if (previousVote === false && vote === true) {
      currentResult = (currentYes + addressDetails.lockedDgdStake) / proposal.draftVoting.totalVoterStake;
    }
    proposal.draftVoting.currentResult = currentResult;
  }

  // update proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  });

  // update address
  await updateAddress(res._from, {
    $set: { votes },
  }, {});
  console.log('INSERTED refreshProposalDraftVote');
};

// DONE
const refreshProposalDraftVotingClaim = async (res) => {
  if (res._events.length === 0) return;
  const proposal = await getProposal(res._proposalId);
  proposal.draftVoting.claimed = true;
  proposal.draftVoting.passed = _getResult(res);

  if (proposal.draftVoting.passed === true) {
    proposal.stage = proposalStages.PROPOSAL;
    proposal.votingStage = proposalVotingStages.COMMIT;
    proposal.currentVotingRound = 0;
    proposal.votingRounds = [];
    const votingStartTime = await getContracts().daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(0));
    const commitPhaseDuration = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_COMMIT_PHASE);
    const votingPhaseDuration = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_PHASE_TOTAL);
    const votingQuorum = await getContracts().daoCalculatorService.minimumVotingQuorum.call(res._proposalId, new BigNumber(0));
    const quotaNumerator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR)).toNumber();
    const quotaDenominator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR)).toNumber();
    proposal.votingRounds.push({
      startTime: votingStartTime.toNumber(),
      commitDeadline: votingStartTime.plus(commitPhaseDuration).toNumber(),
      revealDeadline: votingStartTime.plus(votingPhaseDuration).toNumber(),
      quorum: votingQuorum.toNumber(),
      quota: quotaNumerator * 100 / quotaDenominator,
      totalVoterCount: 0,
      totalVoterStake: 0,
      currentResult: 0,
      claimed: false,
      passed: false,
      funded: false,
    });
  } else {
    proposal.stage = proposalStages.ARCHIVED;
    proposal.votingStage = proposalVotingStages.NONE;
  }

  // update the proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  }, { upsert: true });
  console.log('INSERTED refreshProposalDraftVotingClaim');
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
    addresses.getAllAddresses(db, async (allAddresses) => {
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
    addresses.getAllAddresses(db, async (allAddresses) => {
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

module.exports = {
  refreshProposalNew,
  refreshProposalDetails,
  refreshProposalEndorseProposal,
  refreshProposalFinalizeProposal,
  refreshProposalDraftVote,
  refreshProposalDraftVotingClaim,
};
