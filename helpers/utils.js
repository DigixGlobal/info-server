const BigNumber = require('bignumber.js');
const crypto = require('crypto');

const {
  denominators,
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
    return ((new BigNumber(a)).div(new BigNumber(denominator))).toString();
  });
};

const ofOne = function (value, denominator) {
  return ((new BigNumber(value)).div(new BigNumber(denominator))).toString();
};

const serializeProposal = function (proposal) {
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

const serializeProposalVotingRound = function (proposal, index) {
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
  if (proposal.voting) {
    proposal.voting.totalVoterStake = new BigNumber(proposal.voting.totalVoterStake);
    proposal.voting.totalVoterCount = new BigNumber(proposal.voting.totalVoterCount);
    proposal.voting.yes = new BigNumber(proposal.voting.yes);
    proposal.voting.no = new BigNumber(proposal.voting.no);
  }
  return proposal;
};

const serializeAddress = function (address) {
  address.lockedDgdStake = new BigNumber(address.lockedDgdStake);
  address.lockedDgd = new BigNumber(address.lockedDgd);
  address.reputationPoint = new BigNumber(address.reputationPoint);
  address.quarterPoint = new BigNumber(address.quarterPoint);

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

  if (proposal.voting) {
    proposal.voting.totalVoterStake = ofOne(proposal.voting.totalVoterStake, denominators.DGD);
    proposal.voting.yes = ofOne(proposal.voting.yes, denominators.DGD);
    proposal.voting.no = ofOne(proposal.voting.no, denominators.DGD);
    proposal.voting.totalVoterCount = ofOne(proposal.voting.totalVoterCount, 1);
    proposal.voting.quorum = ofOne(proposal.voting.quorum, denominators.DGD);
    proposal.voting.quota = ofOne(proposal.voting.quota, 1);
  }
};

const deserializeAddress = function (address) {
  if (address) {
    if (address.isKycOfficer === true) return address;
    address.lockedDgdStake = ofOne(address.lockedDgdStake, denominators.DGD);
    address.lockedDgd = ofOne(address.lockedDgd, denominators.DGD);
    address.reputationPoint = ofOne(address.reputationPoint, denominators.REPUTATION_POINT);
    address.quarterPoint = ofOne(address.quarterPoint, denominators.QUARTER_POINT);
  }

  return address;
};

const deserializeDaoInfo = function (daoInfo) {
  daoInfo.totalLockedDgds = ofOne(daoInfo.totalLockedDgds, denominators.DGD);
  daoInfo.totalModeratorLockedDgds = ofOne(daoInfo.totalModeratorLockedDgds, denominators.DGD);

  return daoInfo;
};

const deserializeDaoConfigs = function (daoConfigs) {
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
};
