const BigNumber = require('bignumber.js');

const {
  denominators,
} = require('./constants');

const sumArray = function (array) {
  let sum = 0;
  for (const item of array) {
    sum += item;
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

const serializeAddress = function (address) {
  address.lockedDgdStake = new BigNumber(address.lockedDgdStake);
  address.lockedDgd = new BigNumber(address.lockedDgd);
  address.reputationPoint = new BigNumber(address.reputationPoint);
  address.quarterPoint = new BigNumber(address.quarterPoint);

  return address;
};

const deserializeProposal = function (proposal) {
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

const deserializeAddress = function (address) {
  address.lockedDgdStake = ofOne(address.lockedDgdStake, denominators.DGD);
  address.lockedDgd = ofOne(address.lockedDgd, denominators.DGD);
  address.reputationPoint = ofOne(address.reputationPoint, denominators.REPUTATION_POINT);
  address.quarterPoint = ofOne(address.quarterPoint, denominators.QUARTER_POINT);

  return address;
};

const deserializeDaoInfo = function (daoInfo) {
  daoInfo.totalLockedDgds = ofOne(daoInfo.totalLockedDgds, denominators.DGD);
  daoInfo.totalModeratorLockedDgds = ofOne(daoInfo.totalModeratorLockedDgds, denominators.DGD);

  return daoInfo;
};

module.exports = {
  sumArray,
  sumArrayBN,
  getFromFunctionArg,
  getFromEventLog,
  bNArrayToDecimal,
  bNArrayToString,
  ofMany,
  ofOne,
  serializeProposal,
  serializeProposalVotingRound,
  serializeAddress,
  deserializeProposal,
  deserializeAddress,
  deserializeDaoInfo,
};
