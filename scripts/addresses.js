const {
  getAddressDetails,
  updateAddress,
  insertAddress,
} = require('../dbWrapper/addresses');

const {
  updateDao,
} = require('../dbWrapper/dao');

const {
  getProposals,
  updateProposal,
} = require('../dbWrapper/proposals');

const {
  getContracts,
} = require('../helpers/contracts');

const {
  proposalVotingStages,
} = require('../helpers/constants');

const {
  serializeProposal,
  serializeProposalVotingRound,
  serializeAddress,
} = require('../helpers/utils');

const {
  notifyDaoServer,
} = require('./notifier');

const _getAddressObject = (userInfo) => {
  return {
    isParticipant: userInfo[0],
    isModerator: userInfo[1],
    lastParticipatedQuarter: userInfo[2].toNumber(),
    lockedDgdStake: userInfo[3].toString(),
    lockedDgd: userInfo[4].toString(),
    reputationPoint: userInfo[5].toString(),
    quarterPoint: userInfo[6].toString(),
  };
};

const _getInsertAddressObj = (user) => {
  return {
    address: user,
    votes: {},
  };
};

// TODO: move to generic function
// get the value for a `key`
const _getUser = (res) => {
  let user;
  for (const event of res._events) {
    for (const argName in event) {
      if (argName === '_user') {
        user = event[argName];
      }
    }
  }
  return user;
};

const _updateProposalVoteWeightages = async function (addressDetails, userInfo) {
  // update all proposals that are in Draft voting phase
  const draftProposals = await getProposals({ votingStage: proposalVotingStages.DRAFT });
  for (const p of draftProposals) {
    const userVote = addressDetails.votes[p.proposalId];
    if (userVote && userVote.draftVoting && userVote.draftVoting.vote) {
      const proposal = serializeProposal(p);
      if (userVote.draftVoting.vote === true) {
        proposal.draftVoting.yes = proposal.draftVoting.yes.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
        proposal.draftVoting.no = proposal.draftVoting.no.toString();
      } else {
        proposal.draftVoting.no = proposal.draftVoting.no.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
        proposal.draftVoting.yes = proposal.draftVoting.yes.toString();
      }
      proposal.draftVoting.totalVoterStake = proposal.draftVoting.totalVoterStake.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
      proposal.draftVoting.totalVoterCount = proposal.draftVoting.totalVoterCount.toString();
      proposal.draftVoting.quorum = proposal.draftVoting.quorum.toString();
      proposal.draftVoting.quota = proposal.draftVoting.quota.toString();
      await updateProposal(p.proposalId, {
        $set: {
          draftVoting: proposal.draftVoting,
        },
      });
    }
  }

  // update all proposals that are in voting phase
  const votingProposals = await getProposals({ votingStage: proposalVotingStages.COMMIT });
  for (const p of votingProposals) {
    const userVote = addressDetails.votes[p.proposalId];
    const votingRoundIndex = p.currentVotingRound;
    if (userVote && userVote.votingRound[votingRoundIndex] && userVote.votingRound[votingRoundIndex].reveal === true) {
      const proposal = serializeProposalVotingRound(p, votingRoundIndex);
      if (userVote.votingRound[votingRoundIndex].vote === true) {
        proposal.votingRounds[votingRoundIndex].yes = proposal.votingRounds[votingRoundIndex].yes.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
        proposal.votingRounds[votingRoundIndex].no = proposal.votingRounds[votingRoundIndex].no.toString();
      } else {
        proposal.votingRounds[votingRoundIndex].no = proposal.votingRounds[votingRoundIndex].no.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
        proposal.votingRounds[votingRoundIndex].yes = proposal.votingRounds[votingRoundIndex].yes.toString();
      }
      proposal.votingRounds[votingRoundIndex].totalVoterStake = proposal.votingRounds[votingRoundIndex].totalVoterStake.minus(addressDetails.lockedDgdStake).plus(userInfo[3]).toString();
      proposal.votingRounds[votingRoundIndex].totalVoterCount = proposal.votingRounds[votingRoundIndex].totalVoterCount.toString();
      await updateProposal(p.proposalId, {
        $set: proposal,
      });
    }
  }
};

const refreshAddress = async (res) => {
  const user = _getUser(res);

  // get address details from db and contract
  const addressDetails = await getAddressDetails(user);
  const userInfo = await getContracts().daoInformation.readUserInfo.call(user);

  if (addressDetails) {
    await _updateProposalVoteWeightages(serializeAddress(addressDetails), userInfo);
  }

  // update user itself
  if (addressDetails) {
    await updateAddress(user, {
      $set: _getAddressObject(userInfo),
    }, { upsert: true });
  } else {
    await insertAddress({
      ..._getAddressObject(userInfo),
      ..._getInsertAddressObj(user),
    });
    // new address, tell dao-server about new address
    notifyDaoServer({
      method: 'POST',
      path: '/user',
      body: {
        payload: {
          address: user,
        },
      },
    });
  }

  // update lockedDGDs in daoInfo
  const totalLockedDgds = (await getContracts()
    .daoStakeStorage
    .totalLockedDGDStake
    .call()).toNumber();
  const totalModeratorLockedDgds = (await getContracts()
    .daoStakeStorage
    .totalModeratorLockedDGDStake
    .call()).toNumber();
  await updateDao({
    $set: {
      totalLockedDgds: totalLockedDgds.toString(),
      totalModeratorLockedDgds: totalModeratorLockedDgds.toString(),
    },
  });
};

module.exports = {
  refreshAddress,
};
