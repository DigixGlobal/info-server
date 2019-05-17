const BigNumber = require('bignumber.js');
const crypto = require('crypto');

const {
  getCurrentTimestamp,
} = require('@digix/helpers/lib/helpers');

const {
  denominators,
  dijixDefaultFields,
  gasLimits,
  actionableStatus,
  proposalStages,
  proposalVotingStages,
} = require('./constants');

const getServerSignatures = function (req) {
  const retrievedSig = req.headers['access-sign'];
  const retrievedNonce = parseInt(req.headers['access-nonce'], 10);
  const message = req.method + req.originalUrl + JSON.stringify(req.body.payload) + retrievedNonce;
  const computedSig = crypto
    .createHmac('sha256', process.env.SERVER_SECRET)
    .update(message)
    .digest('hex');

  return { retrievedSig, retrievedNonce, computedSig };
};

const readConfig = function () {
  return {
    BLOCK_CONFIRMATIONS: parseInt(process.env.BLOCK_CONFIRMATIONS, 10),
  };
};

const sumArray = function (array) {
  let sum = 0;
  for (const item of array) {
    sum += item;
  }
  return sum;
};

const sumArrayString = function (array) {
  let sum = new BigNumber(0);
  for (const item of array) {
    sum = sum.plus(new BigNumber(item));
  }
  return sum;
};

const bNArrayToDecimal = function (array) {
  return array.map(a => a.toNumber());
};

const bNArrayToString = function (array) {
  return array.map(a => a.toString());
};

const stringArrayToBN = function (array) {
  return array.map(a => new BigNumber(a));
};

const sumArrayBN = function (array) {
  let sum = new BigNumber(0);
  for (const item of array) {
    sum = sum.plus(item);
  }
  return sum;
};

const getFromFunctionArg = function (transaction, argName) {
  for (const param of transaction.decodedInputs.params) {
    if (param.name === argName) {
      return param.value;
    }
  }
};

const getFromEventLog = function (res, argName) {
  for (const event of res._events) {
    for (const arg in event) {
      if (arg === argName) {
        return event[arg];
      }
    }
  }
};

const ofMany = function (array, denominator) {
  return array.map((a) => {
    if (a === null || a === undefined) return a;
    return ((new BigNumber(a)).div(new BigNumber(denominator))).toString();
  });
};

const ofOne = function (value, denominator) {
  if (value === null || value === undefined) return value;
  return ((new BigNumber(value)).div(new BigNumber(denominator))).toString();
};

const serializeProposal = function (proposal) {
  if (proposal === null) return proposal;
  // resolve proposal version
  for (const version of proposal.proposalVersions) {
    version.milestoneFundings = stringArrayToBN(version.milestoneFundings);
    version.finalReward = new BigNumber(version.finalReward);
    version.totalFunding = new BigNumber(version.totalFunding);
  }

  // resolve draft voting
  if (proposal.draftVoting) {
    proposal.draftVoting.totalVoterStake = new BigNumber(proposal.draftVoting.totalVoterStake);
    proposal.draftVoting.quorum = new BigNumber(proposal.draftVoting.quorum);
    proposal.draftVoting.quota = new BigNumber(proposal.draftVoting.quota);
    proposal.draftVoting.yes = new BigNumber(proposal.draftVoting.yes);
    proposal.draftVoting.no = new BigNumber(proposal.draftVoting.no);
    proposal.draftVoting.totalVoterCount = new BigNumber(proposal.draftVoting.totalVoterCount);
  }

  // resolve voting rounds
  if (proposal.votingRounds) {
    for (const round of proposal.votingRounds) {
      round.totalVoterStake = new BigNumber(round.totalVoterStake);
      round.quorum = new BigNumber(round.quorum);
      round.quota = new BigNumber(round.quota);
      round.yes = new BigNumber(round.yes);
      round.no = new BigNumber(round.no);
      round.totalVoterCount = new BigNumber(round.totalVoterCount);
    }
  }

  // resolve funding
  if (proposal.claimableFunding !== null) {
    proposal.claimableFunding = new BigNumber(proposal.claimableFunding);
  }

  return proposal;
};

const proposalToType = function (proposal) {
  return proposal;
};

const serializeProposalVotingRound = function (proposal, index) {
  if (proposal === null) return proposal;
  if (proposal.votingRounds) {
    const round = proposal.votingRounds[index];
    if (round) {
      round.totalVoterStake = new BigNumber(round.totalVoterStake);
      round.yes = new BigNumber(round.yes);
      round.no = new BigNumber(round.no);
      round.totalVoterCount = new BigNumber(round.totalVoterCount);
    }
  }

  return proposal;
};

const serializeSpecialProposal = function (proposal) {
  if (proposal === null) return proposal;
  if (proposal.votingRounds && proposal.votingRounds.length > 0) {
    proposal.votingRounds[0].totalCommitCount = new BigNumber(proposal.votingRounds[0].totalCommitCount);
    proposal.votingRounds[0].totalVoterStake = new BigNumber(proposal.votingRounds[0].totalVoterStake);
    proposal.votingRounds[0].totalVoterCount = new BigNumber(proposal.votingRounds[0].totalVoterCount);
    proposal.votingRounds[0].yes = new BigNumber(proposal.votingRounds[0].yes);
    proposal.votingRounds[0].no = new BigNumber(proposal.votingRounds[0].no);
  }
  return proposal;
};

const serializeAddress = function (address) {
  if (address) {
    if (
      address.isKycOfficer === true
      || address.isForumAdmin === true
    ) return address;

    address.lockedDgdStake = new BigNumber(address.lockedDgdStake);
    address.lockedDgd = new BigNumber(address.lockedDgd);
    address.reputationPoint = new BigNumber(address.reputationPoint);
    address.quarterPoint = new BigNumber(address.quarterPoint);
    address.moderatorQuarterPoint = new BigNumber(address.moderatorQuarterPoint);
  }

  return address;
};

const deserializeProposal = function (proposal) {
  if (proposal === null) return proposal;

  // resolve proposal version
  for (const version of proposal.proposalVersions) {
    version.milestoneFundings = ofMany(version.milestoneFundings, denominators.ETH);
    version.finalReward = ofOne(version.finalReward, denominators.ETH);
    version.totalFunding = ofOne(version.totalFunding, denominators.ETH);
  }

  // resolve draft voting
  if (proposal.draftVoting) {
    proposal.draftVoting.totalVoterStake = ofOne(proposal.draftVoting.totalVoterStake, denominators.DGD);
    proposal.draftVoting.quorum = ofOne(proposal.draftVoting.quorum, denominators.DGD);
    proposal.draftVoting.quota = ofOne(proposal.draftVoting.quota, 1);
    proposal.draftVoting.yes = ofOne(proposal.draftVoting.yes, denominators.DGD);
    proposal.draftVoting.no = ofOne(proposal.draftVoting.no, denominators.DGD);
    proposal.draftVoting.totalVoterCount = ofOne(proposal.draftVoting.totalVoterCount, 1);
  }

  // resolve voting rounds
  if (proposal.votingRounds) {
    for (const round of proposal.votingRounds) {
      round.totalVoterStake = ofOne(round.totalVoterStake, denominators.DGD);
      round.quorum = ofOne(round.quorum, denominators.DGD);
      round.quota = ofOne(round.quota, 1);
      round.yes = ofOne(round.yes, denominators.DGD);
      round.no = ofOne(round.no, denominators.DGD);
      round.totalVoterCount = ofOne(round.totalVoterCount, 1);
    }
  }

  // resolve funding
  if (proposal.claimableFunding !== null) {
    proposal.claimableFunding = ofOne(proposal.claimableFunding, denominators.ETH);
  }

  return proposal;
};

const deserializeSpecialProposal = function (proposal) {
  if (proposal === null) return proposal;

  if (proposal.votingRounds && proposal.votingRounds.length > 0) {
    proposal.votingRounds[0].totalVoterStake = ofOne(proposal.votingRounds[0].totalVoterStake, denominators.DGD);
    proposal.votingRounds[0].yes = ofOne(proposal.votingRounds[0].yes, denominators.DGD);
    proposal.votingRounds[0].no = ofOne(proposal.votingRounds[0].no, denominators.DGD);
    proposal.votingRounds[0].totalVoterCount = ofOne(proposal.votingRounds[0].totalVoterCount, 1);
    proposal.votingRounds[0].totalCommitCount = ofOne(proposal.votingRounds[0].totalCommitCount, 1);
    proposal.votingRounds[0].quorum = ofOne(proposal.votingRounds[0].quorum, denominators.DGD);
    proposal.votingRounds[0].quota = ofOne(proposal.votingRounds[0].quota, 1);
  }

  return proposal;
};

const deserializeAddress = function (address) {
  if (address) {
    if (
      address.isKycOfficer === true
      || address.isForumAdmin === true
    ) return address;
    address.lockedDgdStake = ofOne(address.lockedDgdStake, denominators.DGD);
    address.lockedDgd = ofOne(address.lockedDgd, denominators.DGD);
    address.reputationPoint = ofOne(address.reputationPoint, denominators.REPUTATION_POINT);
    address.quarterPoint = ofOne(address.quarterPoint, denominators.QUARTER_POINT);
    address.moderatorQuarterPoint = ofOne(address.moderatorQuarterPoint, denominators.QUARTER_POINT);
    address.claimableDgx = ofOne(address.claimableDgx, denominators.DGX);
  }

  return address;
};

const deserializeDaoInfo = function (daoInfo) {
  if (daoInfo === null) return daoInfo;
  daoInfo.totalLockedDgds = ofOne(daoInfo.totalLockedDgds, denominators.DGD);
  daoInfo.totalModeratorLockedDgds = ofOne(daoInfo.totalModeratorLockedDgds, denominators.DGD);

  return daoInfo;
};

const deserializeDaoConfigs = function (daoConfigs) {
  if (daoConfigs === null) return daoConfigs;
  daoConfigs.CONFIG_MINIMUM_DGD_FOR_MODERATOR = ofOne(daoConfigs.CONFIG_MINIMUM_DGD_FOR_MODERATOR, denominators.DGD);
  daoConfigs.CONFIG_PREPROPOSAL_COLLATERAL = ofOne(daoConfigs.CONFIG_PREPROPOSAL_COLLATERAL, denominators.ETH);
  daoConfigs.CONFIG_MINIMUM_LOCKED_DGD = ofOne(daoConfigs.CONFIG_MINIMUM_LOCKED_DGD, denominators.DGD);
  daoConfigs.CONFIG_MAX_FUNDING_FOR_NON_DIGIX = ofOne(daoConfigs.CONFIG_MAX_FUNDING_FOR_NON_DIGIX, denominators.ETH);
  daoConfigs.CONFIG_MINIMUM_REPUTATION_FOR_MODERATOR = ofOne(daoConfigs.CONFIG_MINIMUM_REPUTATION_FOR_MODERATOR, denominators.REPUTATION_POINT);

  return daoConfigs;
};

const getOriginalFundings = function (fundings, finalReward) {
  const originalFundings = {
    milestones: [],
    finalReward: {},
  };
  fundings.forEach(function (funding) {
    originalFundings.milestones.push({
      original: ofOne(funding, denominators.ETH),
    });
  });
  originalFundings.finalReward.original = ofOne(finalReward, denominators.ETH);

  return originalFundings;
};

const getUpdatedFundings = function (changedFundings, finalFundings, finalReward) {
  finalFundings.forEach(function (funding, index) {
    changedFundings.milestones[index].updated = ofOne(funding, denominators.ETH);
  });
  changedFundings.finalReward.updated = ofOne(finalReward, denominators.ETH);

  return changedFundings;
};

const getDefaultDijixFields = function () {
  return {
    title: dijixDefaultFields.TITLE,
    description: dijixDefaultFields.DESCRIPTION,
    details: dijixDefaultFields.DETAILS,
    milestones: [
      {
        title: dijixDefaultFields.MILESTONE_TITLE,
        description: dijixDefaultFields.MILESTONE_DESCRIPTION,
      },
    ],
  };
};

const _getAdditionalDocObj = function (doc) {
  if (doc === null || doc === undefined) return doc;
  const doc2 = {
    ...doc.data.attestation.moreDocs,
    created: Math.floor(doc.created / 1000),
  };
  return doc2;
};

const getAdditionalDocs = function (docs) {
  const additionalDocs = [];
  for (const doc of docs) {
    additionalDocs.push(_getAdditionalDocObj(doc));
  }
  return additionalDocs;
};

const getTxConfigs = function () {
  return {
    gas: {
      // participation
      LOCK_DGD: gasLimits.LOCK_DGD,
      UNLOCK_DGD: gasLimits.UNLOCK_DGD,
      CONFIRM_CONTINUE_PARTICIPATION: gasLimits.CONFIRM_CONTINUE_PARTICIPATION,
      CLAIM_REWARDS: gasLimits.CLAIM_REWARDS,
      // voting
      MODERATOR_VOTE: gasLimits.MODERATOR_VOTE,
      COMMIT_VOTE: gasLimits.COMMIT_VOTE,
      REVEAL_VOTE: gasLimits.REVEAL_VOTE,
      COMMIT_VOTE_SPECIAL: gasLimits.COMMIT_VOTE_SPECIAL,
      REVEAL_VOTE_SPECIAL: gasLimits.REVEAL_VOTE_SPECIAL,
      // claim voting
      CLAIM_DRAFT_VOTING: gasLimits.CLAIM_DRAFT_VOTING,
      CLAIM_VOTING: gasLimits.CLAIM_VOTING,
      CLAIM_SPECIAL_VOTING: gasLimits.CLAIM_SPECIAL_VOTING,
      // proposal
      CREATE_PROPOSAL: gasLimits.CREATE_PROPOSAL,
      ENDORSE_PROPOSAL: gasLimits.ENDORSE_PROPOSAL,
      EDIT_PROPOSAL: gasLimits.EDIT_PROPOSAL,
      FINALIZE_PROPOSAL: gasLimits.FINALIZE_PROPOSAL,
      CLAIM_FUNDING: gasLimits.CLAIM_FUNDING,
      FINISH_MILESTONE: gasLimits.FINISH_MILESTONE,
      ADD_PROPOSAL_DOC: gasLimits.ADD_PROPOSAL_DOC,
      CHANGE_FUNDINGS: gasLimits.CHANGE_FUNDINGS,
      ABORT_PROPOSAL: gasLimits.ABORT_PROPOSAL,
      // default value
      DEFAULT: gasLimits.DEFAULT_GAS,
    },
  };
};

const getCurrentActionableStatus = function (proposal, user) {
  if (!proposal || !user) return actionableStatus.NONE;

  const currentTime = getCurrentTimestamp();
  if (
    proposal.stage === proposalStages.IDEA
    && user.isModerator
  ) {
    return actionableStatus.AWAITING_ENDORSEMENT;
  }
  if (
    proposal.votingStage === proposalVotingStages.DRAFT
    && currentTime > proposal.draftVoting.startTime
    && currentTime < proposal.draftVoting.votingDeadline
    && user.isModerator
  ) {
    return actionableStatus.MODERATOR_VOTING;
  }
  if (
    proposal.votingStage === proposalVotingStages.DRAFT
    && currentTime > proposal.draftVoting.votingDeadline
    && user.address === proposal.proposer
  ) {
    return actionableStatus.CLAIM_VOTING;
  }
  if (
    proposal.votingStage === proposalVotingStages.COMMIT
    && currentTime > proposal.votingRounds[proposal.currentVotingRound].startTime
    && currentTime < proposal.votingRounds[proposal.currentVotingRound].commitDeadline
    && (user.isModerator || user.isParticipant)
  ) {
    return actionableStatus.COMMIT_PHASE;
  }
  if (
    proposal.votingStage === proposalVotingStages.COMMIT
    && currentTime > proposal.votingRounds[proposal.currentVotingRound].commitDeadline
    && currentTime < proposal.votingRounds[proposal.currentVotingRound].revealDeadline
    && (user.isModerator || user.isParticipant)
  ) {
    return actionableStatus.REVEAL_PHASE;
  }
  if (
    proposal.votingStage === proposalVotingStages.COMMIT
    && currentTime > proposal.votingRounds[proposal.currentVotingRound].revealDeadline
    && user.address === proposal.proposer
  ) {
    return actionableStatus.CLAIM_VOTING;
  }
  if (
    proposal.stage === proposalStages.ONGOING
    && proposal.claimableFunding !== null
    && proposal.claimableFunding !== undefined
    && proposal.claimableFunding !== '0'
    && user.address === proposal.proposer
  ) {
    return actionableStatus.CLAIM_FUNDING;
  }
  if (
    proposal.isActive
    && currentTime > proposal.votingRounds[0].startTime
    && currentTime < proposal.votingRounds[0].commitDeadline
    && (user.isModerator || user.isParticipant)
  ) {
    return actionableStatus.COMMIT_PHASE;
  }
  if (
    proposal.isActive
    && currentTime > proposal.votingRounds[0].commitDeadline
    && currentTime < proposal.votingRounds[0].revealDeadline
    && (user.isModerator || user.isParticipant)
  ) {
    return actionableStatus.REVEAL_PHASE;
  }
  return actionableStatus.NONE;
};

module.exports = {
  sumArray,
  sumArrayBN,
  sumArrayString,
  getFromFunctionArg,
  getFromEventLog,
  bNArrayToDecimal,
  bNArrayToString,
  ofMany,
  ofOne,
  serializeProposal,
  proposalToType,
  serializeSpecialProposal,
  serializeProposalVotingRound,
  serializeAddress,
  deserializeProposal,
  deserializeSpecialProposal,
  deserializeAddress,
  deserializeDaoInfo,
  deserializeDaoConfigs,
  readConfig,
  getOriginalFundings,
  getUpdatedFundings,
  getServerSignatures,
  getDefaultDijixFields,
  getAdditionalDocs,
  getTxConfigs,
  getCurrentActionableStatus,
};
