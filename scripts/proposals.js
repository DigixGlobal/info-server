const BigNumber = require('bignumber.js');

const {
  indexRange,
  decodeHash,
} = require('@digix/helpers/lib/helpers');

const {
  sumArrayBN,
  getFromEventLog,
  bNArrayToDecimal,
} = require('../helpers/utils');

const {
  readProposalIndices,
  readProposalVersionIndices,
  readProposalPRLActions,
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

const {
  fetchProposalVersion,
} = require('../dijixWrapper/proposals');

// TODO: proposal.votingStage does not change
// from COMMIT to REVEAL automatically
// check all proposals in votingStage === COMMIT (in cron)
// and update them to REVEAL if the commitDeadline has passed

// TODO: proposal.votingStage does not change
// from REVEAL to ONGOING/ARCHIVE automatically
// unless the voting round is claimed by the proposer/someone
// check all proposals in votingStage === REVEAL (in cron)
// and mark them as CLAIMABLE if the revealDeadline has passed

// DONE
const refreshProposalNew = async (res) => {
  const proposal = {};
  const _proposalId = getFromEventLog(res, '_proposalId');
  const proposalDetails = await getContracts().daoStorage.readProposal.call(_proposalId);
  proposal.proposalId = proposalDetails[readProposalIndices.proposalId];
  proposal.proposer = proposalDetails[readProposalIndices.proposer];
  proposal.endorser = proposalDetails[readProposalIndices.endorser];
  proposal.stage = proposalStages.IDEA;
  proposal.timeCreated = proposalDetails[readProposalIndices.timeCreated].toNumber();
  proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];
  proposal.prl = proposalDetails[readProposalIndices.prl];
  proposal.isDigix = proposalDetails[readProposalIndices.isDigix];
  proposal.claimableFunding = 0;
  proposal.currentMilestone = -1;

  const nVersions = proposalDetails[readProposalIndices.nVersions];
  proposal.proposalVersions = [];
  let currentVersion = _proposalId;
  for (const v in indexRange(0, nVersions)) {
    console.log('version id : ', v);
    const proposalVersion = await getContracts().daoStorage.readProposalVersion.call(_proposalId, currentVersion);
    const ipfsDoc = await fetchProposalVersion('Qm'.concat(decodeHash(proposalVersion[readProposalVersionIndices.docIpfsHash]).slice(2)));
    proposal.proposalVersions.push({
      docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
      created: proposalVersion[readProposalVersionIndices.created].toNumber(),
      milestoneFundings: bNArrayToDecimal(proposalVersion[readProposalVersionIndices.milestoneFundings]),
      finalReward: proposalVersion[readProposalVersionIndices.finalReward].toNumber(),
      moreDocs: [],
      totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])).toNumber(),
      dijixObject: {
        ...ipfsDoc.data.attestation,
        images: ipfsDoc.data.proofs,
      },
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
  proposal.timeCreated = proposalDetails[readProposalIndices.timeCreated].toNumber();
  proposal.finalVersionIpfsDoc = proposalDetails[readProposalIndices.finalVersionIpfsDoc];
  proposal.prl = proposalDetails[readProposalIndices.prl];
  proposal.isDigix = proposalDetails[readProposalIndices.isDigix];

  const nVersions = proposalDetails[readProposalIndices.nVersions];
  proposal.proposalVersions = [];
  let currentVersion = res._proposalId;
  for (const v in indexRange(0, nVersions)) {
    console.log('version id : ', v);
    const proposalVersion = await getContracts().daoStorage.readProposalVersion.call(res._proposalId, currentVersion);
    const ipfsDoc = await fetchProposalVersion('Qm'.concat(decodeHash(proposalVersion[readProposalVersionIndices.docIpfsHash]).slice(2)));
    let proposalDocs = [];
    if (proposalVersion === proposal.finalVersionIpfsDoc) {
      proposalDocs = await getContracts().daoStorage.readProposalDocs.call(res._proposalId);
    }
    proposal.proposalVersions.push({
      docIpfsHash: proposalVersion[readProposalVersionIndices.docIpfsHash],
      created: proposalVersion[readProposalVersionIndices.created].toNumber(),
      milestoneFundings: bNArrayToDecimal(proposalVersion[readProposalVersionIndices.milestoneFundings]),
      finalReward: proposalVersion[readProposalVersionIndices.finalReward].toNumber(),
      moreDocs: proposalDocs,
      totalFunding: proposalVersion[readProposalVersionIndices.finalReward].plus(sumArrayBN(proposalVersion[readProposalVersionIndices.milestoneFundings])).toNumber(),
      dijixObject: {
        ...ipfsDoc.data.attestation,
        images: ipfsDoc.data.proofs,
      },
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
  await updateProposal(res._proposalId, {
    $set: {
      endorser: res._from,
      stage: proposalStages.DRAFT,
    },
  });
  console.log('INSERTED refreshProposalEndorseProposal');
};

// DONE
const refreshProposalFinalizeProposal = async (res) => {
  // read current proposal from DB
  const proposal = await getProposal(res._proposalId);
  const proposalDetails = await getContracts().daoStorage.readProposal.call(res._proposalId);
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

  votes[res._proposalId] = {
    draftVoting: { vote },
    votingRound: {},
  };

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
  if (res._done === false) return;
  const proposal = await getProposal(res._proposalId);
  proposal.draftVoting.claimed = true;
  proposal.draftVoting.passed = res._passed;

  // if the draft voting has failed
  proposal.stage = proposalStages.ARCHIVED;
  proposal.votingStage = proposalVotingStages.NONE;

  if (proposal.draftVoting.passed === true) {
    proposal.stage = proposalStages.PROPOSAL;
    proposal.votingStage = proposalVotingStages.COMMIT;
    proposal.currentVotingRound = 0;
    proposal.votingRounds = [];
    const votingStartTime = (await getContracts().daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(0))).toNumber();
    const commitPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_COMMIT_PHASE)).toNumber();
    const votingPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_PHASE_TOTAL)).toNumber();
    const votingQuorum = (await getContracts().daoCalculatorService.minimumVotingQuorum.call(res._proposalId, new BigNumber(0))).toNumber();
    const quotaNumerator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR)).toNumber();
    const quotaDenominator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR)).toNumber();
    proposal.votingRounds.push({
      startTime: votingStartTime,
      commitDeadline: votingStartTime + commitPhaseDuration,
      revealDeadline: votingStartTime + votingPhaseDuration,
      quorum: votingQuorum,
      quota: quotaNumerator * 100 / quotaDenominator,
      totalCommitCount: 0,
      totalVoterCount: 0,
      totalVoterStake: 0,
      currentResult: 0,
      claimed: false,
      passed: false,
      funded: false,
    });
  }

  // update the proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  }, { upsert: true });
  console.log('INSERTED refreshProposalDraftVotingClaim');
};

// DONE
const refreshProposalCommitVote = async (res) => {
  // get the current info on proposal and address
  const proposal = await getProposal(res._proposalId);
  const addressDetails = await getAddressDetails(res._from);
  const { votes } = addressDetails;

  // create object if never voted before in this proposal
  if (votes[res._proposalId] === undefined) {
    votes[res._proposalId] = { votingRound: {} };
  }

  // increment totalCommitCount if this user is committing
  // vote for the first time for this voting round
  if (votes[res._proposalId].votingRound[res._index] === undefined) {
    // first time committing in this round
    proposal.votingRounds[res._index].totalCommitCount += 1;
  }

  // set commit to true
  votes[res._proposalId].votingRound[res._index] = {
    commit: true,
    reveal: false,
  };

  await updateProposal(res._proposalId, {
    $set: proposal,
  });

  await updateAddress(res._from, {
    $set: { votes },
  });
  console.log('INSERTED refreshProposalCommitVote');
};

// DONE
const refreshProposalRevealVote = async (res) => {
  // get proposal and address info
  const proposal = await getProposal(res._proposalId);
  const addressDetails = await getAddressDetails(res._from);
  const vote = res._vote;
  const currentYes = proposal.votingRounds[res._index].currentResult * proposal.votingRounds[res._index].totalVoterStake;

  // vote can be revealed only once, so this condition has to be satisied if revealing
  if (addressDetails.votes[res._proposalId].votingRound[res._index].reveal === false) {
    // revealing vote
    proposal.votingRounds[res._index].totalVoterCount += 1;
    proposal.votingRounds[res._index].totalVoterStake += addressDetails.lockedDgdStake;
    let currentResult;
    if (vote === true) {
      currentResult = (currentYes + addressDetails.lockedDgdStake) / proposal.votingRounds[res._index].totalVoterStake;
    } else {
      currentResult = currentYes / proposal.votingRounds[res._index].totalVoterStake;
    }
    proposal.votingRounds[res._index].currentResult = currentResult;
  }

  // update the vote info for this address
  const { votes } = addressDetails;
  votes[res._proposalId].votingRound[res._index].reveal = true;
  votes[res._proposalId].votingRound[res._index].vote = vote;

  await updateAddress(res._from, {
    $set: { votes },
  });

  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalRevealVote');
};

// DONE
// TODO: if this is the final voting round, i.e. `index === milestoneFundings.length`
// 1. claimableFunding will be the finalReward (this has been taken care of)
// 2. currentMilestone should not change
// 3. currentMilestoneStart should not change
// 4. proposal.stage should be ARCHIVED
const refreshProposalVotingClaim = async (res) => {
  // this is a multi-step function
  // if there were no event logs, it is only an intermediate step
  // consider this fn call only if event logs were present
  if (res._done === false) return;

  // get the current proposal info
  const proposal = await getProposal(res._proposalId);
  const result = res._passed;
  const index = res._index;
  proposal.votingRounds[index].claimed = true;
  proposal.votingRounds[index].passed = result;

  // result === false take care here
  proposal.votingStage = proposalVotingStages.NONE;
  proposal.stage = proposalStages.ARCHIVED;

  // voting round has passed
  if (result === true) {
    proposal.stage = proposalStages.ONGOING;
    const milestoneFunding = await getContracts().daoStorage.readProposalMilestone.call(res._proposalId, new BigNumber(index));
    proposal.claimableFunding += milestoneFunding.toNumber();
    proposal.currentMilestone = parseInt(index, 10) + 1;
    proposal.currentMilestoneStart = proposal.votingRounds[index].revealDeadline;
  }

  // update proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalVotingClaim');
};

// TO BE TESTED
const refreshProposalClaimFunding = async (res) => {
  // get the current proposal
  const proposal = await getProposal(res._proposalId);
  const fundingClaimed = getFromEventLog(res, '_funding');

  // claimable funding is now reduced by the claimed funds
  const claimableFunding = proposal.claimableFunding - fundingClaimed;

  // update proposal for claimableFunding
  await updateProposal(res._proposalId, {
    $set: { claimableFunding },
  });
  console.log('INSERTED refreshProposalClaimFunding');
};

// TO BE TESTED
const refreshProposalFinishMilestone = async (res) => {
  // get current proposal details
  const proposal = await getProposal(res._proposalId);
  proposal.stage = proposalStages.REVIEW;
  proposal.votingStage = proposalVotingStages.COMMIT;
  const index = parseInt(getFromEventLog(res, '_milestoneIndex'), 10);
  proposal.currentVotingRound = index + 1;

  // read voting round info
  const votingStartTime = (await getContracts().daoStorage.readProposalVotingTime.call(res._proposalId, new BigNumber(proposal.currentVotingRound))).toNumber();
  const commitPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_INTERIM_COMMIT_PHASE)).toNumber();
  const votingPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_INTERIM_PHASE_TOTAL)).toNumber();
  const votingQuorum = (await getContracts().daoCalculatorService.minimumVotingQuorum.call(res._proposalId, new BigNumber(proposal.currentVotingRound))).toNumber();
  const quotaNumerator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR)).toNumber();
  const quotaDenominator = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR)).toNumber();

  // add new voting round
  proposal.votingRounds.push({
    startTime: votingStartTime,
    commitDeadline: votingStartTime + commitPhaseDuration,
    revealDeadline: votingStartTime + votingPhaseDuration,
    quorum: votingQuorum,
    quota: quotaNumerator * 100 / quotaDenominator,
    totalCommitCount: 0,
    totalVoterCount: 0,
    totalVoterStake: 0,
    currentResult: 0,
    claimed: false,
    passed: false,
    funded: false,
  });

  // update proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalFinishMilestone');
};

// TO BE TESTED
const refreshProposalClose = async (res) => {
  await updateProposal(res._proposalId, {
    $set: {
      stage: proposalStages.ARCHIVED,
      votingStage: proposalVotingStages.NONE,
    },
  });
  console.log('INSERTED refreshProposalClose');
};

// TO BE TESTED
const refreshProposalsFounderClose = async (res) => {
  if (res._events.length === 0) return;
  for (const event of res._events) {
    console.log('event is = ', event);
    await updateProposal(event._proposalId, {
      $set: {
        stage: proposalStages.ARCHIVED,
        votingStage: proposalVotingStages.NONE,
      },
    });
    console.log('INSERTED one of refreshProposalsFounderClose');
  }
};

// TO BE TESTED
const refreshProposalPRLAction = async (res) => {
  const actionId = getFromEventLog(res, '_actionId');
  console.log('action Id = ', actionId);
  const updateObj = { prl: readProposalPRLActions[actionId] };
  if (actionId === 1) {
    console.log('it is stop');
    updateObj.stage = proposalStages.ARCHIVED;
    updateObj.votingStage = proposalVotingStages.NONE;
  }

  await updateProposal(res._proposalId, {
    $set: updateObj,
  });
};

// IN LATER SPRINTS
// const refreshProposalCommitVoteOnSpecial = async (db, contracts, res) => {
//   // update proposals
//   const proposals = db.get('proposals');
//   proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
//     // update addresses
//     const addresses = db.get('addresses');
//     addresses.findOne({ address: res._from }, async function (err, participant) {
//       const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_NUMERATOR);
//       const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_DENOMINATOR);
//       const voterStake = await contracts.daoStakeStorage.lockedDGDStake.call(res._from);
//       proposal.votingRounds[0].quorum = await contracts.daoCalculatorService.minimumVotingQuorumForSpecial.call();
//       proposal.votingRounds[0].quota = quotaNumerator.idiv(quotaDenominator);
//       if (participant.votes[res._proposalId].votingRounds[0].commit === false) {
//         proposal.votingRounds[0].totalVoterStake = proposal.votingRounds[0].totalVoterStake.plus(voterStake);
//         proposal.votingRounds[0].totalVoterCount = proposal.votingRounds[0].totalVoterCount.plus(new BigNumber(1));
//       }
//       proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
//
//       participant.votes[res._proposalId].votingRound = {};
//       participant.votes[res._proposalId].votingRound[0].commit = true;
//       addresses.update({ address: res._from }, participant, { upsert: true });
//     });
//   });
// };

// IN LATER SPRINTS
// const refreshProposalRevealVoteOnSpecial = async (db, contracts, res) => {
//   // update proposals
//   const proposals = db.get('proposals');
//   proposals.findOne({ proposalId: res._proposalId }, function (err, proposal) {
//     addresses.getAllAddresses(db, async (allAddresses) => {
//       const votingCount = await contracts.daoSpecialStorage.readVotingCount.call(res._proposalId, allAddresses);
//       const yesVoters = await contracts.daoSpecialStorage.readVotingVotes.call(res._proposalId, allAddresses, true);
//       const noVoters = await contracts.daoSpecialStorage.readVotingVotes.call(res._proposalId, allAddresses, false);
//       const quotaNumerator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_NUMERATOR);
//       const quotaDenominator = await contracts.daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_SPECIAL_QUOTA_DENOMINATOR);
//       proposal.votingRounds[0].totalVoterStake = votingCount[0].plus(votingCount[1]);
//       proposal.votingRounds[0].totalVoterCount = yesVoters[1].plus(noVoters[1]);
//       proposal.votingRounds[0].currentResult = votingCount[0].idiv(votingCount[0].plus(votingCount[1]));
//       proposal.votingRounds[0].quorum = await contracts.daoCalculatorService.minimumVotingQuorumForSpecial.call();
//       proposal.votingRounds[0].quota = quotaNumerator.idiv(quotaDenominator);
//
//       proposals.update({ proposalId: res._proposalId }, proposal, { upsert: true });
//     });
//   });
//
//   // update addresses
//   const addresses = db.get('addresses');
//   addresses.findOne({ address: res._from }, function (err, participant) {
//     participant.votes[res._proposalId].votingRound[0].reveal = true;
//     addresses.update({ address: res._from }, participant, { upsert: true });
//   });
// };

module.exports = {
  refreshProposalNew,
  refreshProposalDetails,
  refreshProposalEndorseProposal,
  refreshProposalFinalizeProposal,
  refreshProposalDraftVote,
  refreshProposalDraftVotingClaim,
  refreshProposalCommitVote,
  refreshProposalRevealVote,
  refreshProposalVotingClaim,
  refreshProposalClaimFunding,
  refreshProposalFinishMilestone,
  refreshProposalClose,
  refreshProposalsFounderClose,
  refreshProposalPRLAction,
  // refreshProposalCommitVoteOnSpecial,
  // refreshProposalRevealVoteOnSpecial,
};
