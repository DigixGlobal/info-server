const BigNumber = require('bignumber.js');

const {
  indexRange,
  decodeHash,
} = require('@digix/helpers/lib/helpers');

const {
  sumArrayString,
  getFromEventLog,
  serializeAddress,
  serializeProposal,
  serializeProposalVotingRound,
  getOriginalFundings,
  getUpdatedFundings,
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

const {
  notifyDaoServer,
} = require('./notifier');

const {
  getAddressObject,
} = require('./addresses');

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
  proposal.isFundingChanged = false;

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
      milestoneFundings: res._milestonesFundings,
      finalReward: res._finalReward.toString(),
      moreDocs: [],
      totalFunding: (new BigNumber(res._finalReward)).plus(sumArrayString(res._milestonesFundings)).toString(),
      dijixObject: ipfsDoc.data ? {
        ...ipfsDoc.data.attestation,
        images: ipfsDoc.data.proofs,
      } : {},
    });
    currentVersion = await getContracts().daoStorage.getNextProposalVersion.call(_proposalId, currentVersion);
  }

  // update the database
  await insertProposal(proposal);
  console.log('INSERTED refreshProposalNew');

  // new proposal, tell dao-server about new proposal
  notifyDaoServer({
    method: 'POST',
    path: '/proposals',
    body: {
      payload: {
        proposalId: proposal.proposalId,
        proposer: proposal.proposer,
      },
    },
  });
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
      milestoneFundings: res._milestonesFundings,
      finalReward: res._finalReward.toString(),
      moreDocs: proposalDocs,
      totalFunding: res._finalReward.plus(sumArrayString(res._milestonesFundings)).toString(),
      dijixObject: ipfsDoc.data ? {
        ...ipfsDoc.data.attestation,
        images: ipfsDoc.data.proofs,
      } : {},
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

  // fetch the proposalFundings and proposalFinalReward from what is already there in MongoDB
  const finalIndex = proposal.proposalVersions.length - 1;
  const proposalFundings = proposal.proposalVersions[finalIndex].milestoneFundings;
  const proposalFinalReward = proposal.proposalVersions[finalIndex].finalReward;

  // set the original funding values
  proposal.changedFundings = getOriginalFundings(proposalFundings, proposalFinalReward);

  const draftVotingPhase = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_VOTING_PHASE)).toNumber();
  const draftQuotaNumerator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_NUMERATOR);
  const draftQuotaDenominator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_DRAFT_QUOTA_DENOMINATOR);
  proposal.draftVoting = {};
  proposal.draftVoting.startTime = (await getContracts().daoStorage.readProposalDraftVotingTime.call(res._proposalId)).toNumber();
  proposal.draftVoting.votingDeadline = proposal.draftVoting.startTime + draftVotingPhase;
  proposal.draftVoting.totalVoterStake = '0';
  proposal.draftVoting.totalVoterCount = '0';
  proposal.draftVoting.yes = '0';
  proposal.draftVoting.no = '0';
  proposal.draftVoting.quorum = (await getContracts().daoCalculatorService.minimumDraftQuorum.call(res._proposalId)).toString();
  proposal.draftVoting.quota = draftQuotaNumerator.div(draftQuotaDenominator).toString();
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
  const addressDetails = serializeAddress(await getAddressDetails(res._from));
  const proposal = serializeProposal(await getProposal(res._proposalId));
  const vote = res._vote;

  const { votes } = addressDetails;

  // calculate which parts to update
  let currentYes = proposal.draftVoting.yes;
  let currentNo = proposal.draftVoting.no;
  if (addressDetails.votes[res._proposalId] === undefined) {
    const totalVoterCount = proposal.draftVoting.totalVoterCount.plus(1);
    const totalVoterStake = proposal.draftVoting.totalVoterStake.plus(addressDetails.lockedDgdStake);
    if (vote === true) {
      currentYes = currentYes.plus(addressDetails.lockedDgdStake);
    } else {
      currentNo = currentNo.plus(addressDetails.lockedDgdStake);
    }
    proposal.draftVoting.totalVoterCount = totalVoterCount.toString();
    proposal.draftVoting.totalVoterStake = totalVoterStake.toString();
  } else {
    const previousVote = addressDetails.votes[res._proposalId].draftVoting.vote;
    if (previousVote === true && vote === false) {
      currentYes = currentYes.minus(addressDetails.lockedDgdStake);
      currentNo = currentNo.plus(addressDetails.lockedDgdStake);
    } else if (previousVote === false && vote === true) {
      currentYes = currentYes.plus(addressDetails.lockedDgdStake);
      currentNo = currentNo.minus(addressDetails.lockedDgdStake);
    }
    proposal.draftVoting.totalVoterCount = proposal.draftVoting.totalVoterCount.toString();
    proposal.draftVoting.totalVoterStake = proposal.draftVoting.totalVoterStake.toString();
  }

  const userInfo = await getContracts().daoInformation.readUserInfo.call(res._from);
  votes[res._proposalId] = {
    draftVoting: { vote },
    votingRound: {},
  };

  // update proposal
  proposal.draftVoting.quorum = proposal.draftVoting.quorum.toString();
  proposal.draftVoting.quota = proposal.draftVoting.quota.toString();
  proposal.draftVoting.yes = currentYes.toString();
  proposal.draftVoting.no = currentNo.toString();
  await updateProposal(res._proposalId, {
    $set: {
      draftVoting: proposal.draftVoting,
    },
  });

  // update address
  await updateAddress(res._from, {
    $set: {
      votes,
      ...getAddressObject(userInfo),
    },
  }, {});
  console.log('INSERTED refreshProposalDraftVote');
};

// DONE
const refreshProposalDraftVotingClaim = async (res) => {
  const isClaimed = await getContracts().daoStorage.isDraftClaimed.call(res._proposalId);
  if (isClaimed === false) return;
  const proposal = await getProposal(res._proposalId);
  proposal.draftVoting.claimed = true;
  proposal.draftVoting.passed = await getContracts().daoStorage.readProposalDraftVotingResult.call(res._proposalId);

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
    const votingQuorum = await getContracts().daoCalculatorService.minimumVotingQuorum.call(res._proposalId, new BigNumber(0));
    const quotaNumerator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR);
    const quotaDenominator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR);
    proposal.votingRounds.push({
      startTime: votingStartTime,
      commitDeadline: votingStartTime + commitPhaseDuration,
      revealDeadline: votingStartTime + votingPhaseDuration,
      quorum: votingQuorum.toString(),
      quota: quotaNumerator.div(quotaDenominator).toString(),
      totalCommitCount: '0',
      totalVoterCount: '0',
      totalVoterStake: '0',
      yes: '0',
      no: '0',
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
    proposal.votingRounds[res._index].totalCommitCount = (new BigNumber(proposal.votingRounds[res._index].totalCommitCount)).plus(1).toString();
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
  const proposal = serializeProposalVotingRound(await getProposal(res._proposalId), res._index);
  const addressDetails = serializeAddress(await getAddressDetails(res._from));
  const vote = res._vote;

  // vote can be revealed only once, so this condition has to be satisied if revealing
  if (addressDetails.votes[res._proposalId].votingRound[res._index].reveal === false) {
    // revealing vote
    proposal.votingRounds[res._index].totalVoterCount = proposal.votingRounds[res._index].totalVoterCount.plus(1);
    proposal.votingRounds[res._index].totalVoterStake = proposal.votingRounds[res._index].totalVoterStake.plus(addressDetails.lockedDgdStake);
    let currentYes = proposal.votingRounds[res._index].yes;
    let currentNo = proposal.votingRounds[res._index].no;
    if (vote === true) {
      currentYes = currentYes.plus(addressDetails.lockedDgdStake);
    } else {
      currentNo = currentNo.plus(addressDetails.lockedDgdStake);
    }
    proposal.votingRounds[res._index].yes = currentYes.toString();
    proposal.votingRounds[res._index].no = currentNo.toString();
    proposal.votingRounds[res._index].totalVoterCount = proposal.votingRounds[res._index].totalVoterCount.toString();
    proposal.votingRounds[res._index].totalVoterStake = proposal.votingRounds[res._index].totalVoterStake.toString();

    await updateProposal(res._proposalId, {
      $set: proposal,
    });
  }

  // update the vote info for this address
  const userInfo = await getContracts().daoInformation.readUserInfo.call(res._from);
  const { votes } = addressDetails;
  votes[res._proposalId].votingRound[res._index].reveal = true;
  votes[res._proposalId].votingRound[res._index].vote = vote;

  await updateAddress(res._from, {
    $set: {
      votes,
      ...getAddressObject(userInfo),
    },
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
  const isClaimed = await getContracts().daoStorage.isClaimed.call(res._proposalId, res._index);
  if (isClaimed === false) return;

  // get the current proposal info
  const proposal = await getProposal(res._proposalId);
  const index = res._index;
  const result = await getContracts().daoStorage.readProposalVotingResult.call(res._proposalId, index);
  proposal.votingRounds[index].claimed = true;
  proposal.votingRounds[index].passed = result;

  // result === false take care here
  // if it was last review voting round, take care here
  proposal.votingStage = proposalVotingStages.NONE;
  proposal.stage = proposalStages.ARCHIVED;

  // voting round has passed
  // if there is another milestone still to go and voting passed
  const nMilestones = proposal.proposalVersions[proposal.proposalVersions.length - 1].milestoneFundings.length;
  if (index < nMilestones && result === true) {
    proposal.stage = proposalStages.ONGOING;
    const milestoneFunding = await getContracts().daoStorage.readProposalMilestone.call(res._proposalId, new BigNumber(index));
    proposal.claimableFunding = ((new BigNumber(proposal.claimableFunding)).plus(milestoneFunding)).toString();
    proposal.currentMilestone = parseInt(index, 10) + 1;
    proposal.currentMilestoneIndex = parseInt(index, 10);
    proposal.currentMilestoneStart = proposal.votingRounds[index].revealDeadline;
  }

  // update user profile (may have got quarter points)
  // TODO: move to generic function and re-use (avoid code duplication)
  const userInfo = await getContracts().daoInformation.readUserInfo.call(proposal.proposer);
  await updateAddress(proposal.proposer, {
    $set: {
      ...getAddressObject(userInfo),
    },
  });

  // update proposal
  await updateProposal(res._proposalId, {
    $set: proposal,
  });
  console.log('INSERTED refreshProposalVotingClaim');
};

// DONE
const refreshProposalClaimFunding = async (res) => {
  // get the current proposal
  const proposal = serializeProposal(await getProposal(res._proposalId));
  const fundingClaimed = getFromEventLog(res, '_funding');

  // claimable funding is now reduced by the claimed funds
  const claimableFunding = proposal.claimableFunding.minus(fundingClaimed);

  // update proposal for claimableFunding
  await updateProposal(res._proposalId, {
    $set: { claimableFunding: claimableFunding.toString() },
  });
  console.log('INSERTED refreshProposalClaimFunding');
};

// DONE
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
  const votingQuorum = await getContracts().daoCalculatorService.minimumVotingQuorum.call(res._proposalId, new BigNumber(proposal.currentVotingRound));
  const quotaNumerator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_NUMERATOR);
  const quotaDenominator = await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_QUOTA_DENOMINATOR);

  // add new voting round
  proposal.votingRounds.push({
    startTime: votingStartTime,
    commitDeadline: votingStartTime + commitPhaseDuration,
    revealDeadline: votingStartTime + votingPhaseDuration,
    quorum: votingQuorum.toString(),
    quota: quotaNumerator.div(quotaDenominator).toString(),
    totalCommitCount: '0',
    totalVoterCount: '0',
    totalVoterStake: '0',
    yes: '0',
    no: '0',
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

// DONE
const refreshProposalChangeFundings = async (res) => {
  const proposal = await getProposal(res._proposalId);

  proposal.changedFundings = getUpdatedFundings(proposal.changedFundings, res._milestonesFundings, res._finalReward.toString());

  await updateProposal(res._proposalId, {
    $set: {
      isFundingChanged: true,
      changedFundings: proposal.changedFundings,
    },
  });
  console.log('INSERTED refreshProposalChangeFundings');
};

// DONE
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
  refreshProposalChangeFundings,
  refreshProposalClose,
  refreshProposalsFounderClose,
  refreshProposalPRLAction,
  // refreshProposalCommitVoteOnSpecial,
  // refreshProposalRevealVoteOnSpecial,
};
