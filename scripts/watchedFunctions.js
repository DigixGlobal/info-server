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

const tapPromise = t => f => (...args) => f(...args).then((result) => {
  t(result);

  return result;
});

const broadcastUpdatedUser = tapPromise((user) => {
  if (user) {
    console.log(`BROADCASTING userUpdated for ${user.address}`);

    broadcast.userUpdated(user);
  }
});

const broadcastSubmittedProposal = tapPromise((proposal) => {
  if (proposal) {
    console.log(`BROADCASTING proposalSubmitted for ${proposal.proposalId}`);

    broadcast.proposalSubmitted(proposal);
  }
});


const broadcastUpdatedProposal = tapPromise((proposal) => {
  if (proposal) {
    console.log(`BROADCASTING proposalUpdated for ${proposal.proposalId}`);

    broadcast.proposalUpdated(proposal);
  }
});

const multiBroadcast = (splitter, broadcasts) => tapPromise((result) => {
  splitter(result).forEach((value, i) => {
    const broadcast = broadcasts[i];

    broadcast(v => Promise.resolve(v))(value);
  });
});

const watchedFunctionsMap = {
  setStartOfFirstQuarter: initDao,
  calculateGlobalRewardsBeforeNewQuarter: initDao,
  lockDGD: broadcastUpdatedUser(refreshAddress),
  withdrawDGD: broadcastUpdatedUser(refreshAddress),
  confirmContinueParticipation: broadcastUpdatedUser(refreshAddress),
  redeemBadge: broadcastUpdatedUser(refreshAddress),
  claimRewards: broadcastUpdatedUser(refreshAddress),
  submitPreproposal: broadcastSubmittedProposal(refreshProposalNew),
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
