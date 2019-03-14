const { broadcast } = require('../pubsub');

const {
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
  // special
  refreshProposalSpecialNew,
  refreshProposalSpecial,
  refreshProposalCommitVoteOnSpecial,
  refreshProposalRevealVoteOnSpecial,
  refreshProposalSpecialVotingClaim,
} = require('./proposals');

const {
  refreshAddress,
} = require('./addresses');

const {
  initDao,
} = require('./dao');

const broadcastUpdatedUser = f => (...args) => f(...args).then((user) => {
  if (user) {
    broadcast.userUpdated(user);
  }

  return user;
});

const broadcastUpdatedProposal = f => (...args) => f(...args).then((proposal) => {
  if (proposal) {
    broadcast.proposalUpdated(proposal);
  }

  return proposal;
});

const multiBroadcast = (splitter, broadcasts) => f => (...args) => {
  return f(...args)
    .then((result) => {
      splitter(result).forEach((value, i) => {
        const broadcast = broadcasts[i];

        broadcast(Promise.resolve)(value);
      });

      return result;
    });
};

const watchedFunctionsMap = {
  setStartOfFirstQuarter: initDao,
  calculateGlobalRewardsBeforeNewQuarter: initDao,
  lockDGD: broadcastUpdatedUser(refreshAddress),
  withdrawDGD: broadcastUpdatedUser(refreshAddress),
  confirmContinueParticipation: broadcastUpdatedUser(refreshAddress),
  redeemBadge: broadcastUpdatedUser(refreshAddress),
  claimRewards: broadcastUpdatedUser(refreshAddress),
  submitPreproposal: broadcastUpdatedProposal(refreshProposalNew),
  modifyProposal: broadcastUpdatedProposal(refreshProposalDetails),
  endorseProposal: broadcastUpdatedProposal(refreshProposalEndorseProposal),
  finalizeProposal: broadcastUpdatedProposal(refreshProposalFinalizeProposal),
  voteOnDraft: broadcastUpdatedProposal(refreshProposalDraftVote),
  claimDraftVotingResult: broadcastUpdatedProposal(refreshProposalDraftVotingClaim),
  commitVoteOnProposal: broadcastUpdatedProposal(refreshProposalCommitVote),
  revealVoteOnProposal: multiBroadcast(
    ([proposal, user]) => [proposal, user],
    [broadcastUpdatedProposal, broadcastUpdatedUser],
  )(refreshProposalRevealVote),
  claimProposalVotingResult: broadcastUpdatedProposal(refreshProposalVotingClaim),
  claimFunding: broadcastUpdatedProposal(refreshProposalClaimFunding),
  finishMilestone: broadcastUpdatedProposal(refreshProposalFinishMilestone),
  changeFundings: broadcastUpdatedProposal(refreshProposalChangeFundings),
  closeProposal: broadcastUpdatedProposal(refreshProposalClose),
  founderCloseProposals: refreshProposalsFounderClose,
  updatePRL: refreshProposalPRLAction,
  // special proposal
  createSpecialProposal: broadcastUpdatedProposal(refreshProposalSpecialNew),
  startSpecialProposalVoting: broadcastUpdatedProposal(refreshProposalSpecial),
  commitVoteOnSpecialProposal: broadcastUpdatedProposal(refreshProposalCommitVoteOnSpecial),
  revealVoteOnSpecialProposal: broadcastUpdatedProposal(refreshProposalRevealVoteOnSpecial),
  claimSpecialProposalVotingResult: broadcastUpdatedProposal(refreshProposalSpecialVotingClaim),
};

module.exports = {
  watchedFunctionsMap,
};
