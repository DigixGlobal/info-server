const { broadcast } = require('../pubsub');

const {
  refreshProposalNew,
  refreshProposalDetails,
  refreshProposalEndorseProposal,
  refreshProposalFinalizeProposal,
  refreshProposalAddMoreDocs,
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
  initDaoBeforeStart,
  initDaoAtNewQuarter,
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

const broadcastUpdatedDao = tapPromise((daoInfo) => {
  if (daoInfo) {
    console.log('BROADCASTING daoUpdated');

    broadcast.daoUpdated(daoInfo);
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
  setStartOfFirstQuarter: initDaoBeforeStart,
  calculateGlobalRewardsBeforeNewQuarter: initDaoAtNewQuarter,

  lockDGD: multiBroadcast(
    ([daoInfo, user]) => [daoInfo, user],
    [broadcastUpdatedDao, broadcastUpdatedUser],
  )(refreshAddress),
  withdrawDGD: multiBroadcast(
    ([daoInfo, user]) => [daoInfo, user],
    [broadcastUpdatedDao, broadcastUpdatedUser],
  )(refreshAddress),
  confirmContinueParticipation: multiBroadcast(
    ([daoInfo, user]) => [daoInfo, user],
    [broadcastUpdatedDao, broadcastUpdatedUser],
  )(refreshAddress),
  redeemBadge: multiBroadcast(
    ([_daoInfo, user]) => [user],
    [broadcastUpdatedUser],
  )(refreshAddress),
  claimRewards: multiBroadcast(
    ([_daoInfo, user]) => [user],
    [broadcastUpdatedUser],
  )(refreshAddress),
  submitPreproposal: broadcastSubmittedProposal(refreshProposalNew),
  modifyProposal: broadcastUpdatedProposal(refreshProposalDetails),
  endorseProposal: broadcastUpdatedProposal(refreshProposalEndorseProposal),
  finalizeProposal: broadcastUpdatedProposal(refreshProposalFinalizeProposal),
  addProposalDoc: broadcastUpdatedProposal(refreshProposalAddMoreDocs),
  voteOnDraft: multiBroadcast(
    ([proposal, user]) => [proposal, user],
    [broadcastUpdatedProposal, broadcastUpdatedUser],
  )(refreshProposalDraftVote),
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
  revealVoteOnSpecialProposal: multiBroadcast(
    ([proposal, user]) => [proposal, user],
    [broadcastUpdatedProposal, broadcastUpdatedUser],
  )(refreshProposalRevealVoteOnSpecial),
  claimSpecialProposalVotingResult: broadcastUpdatedProposal(refreshProposalSpecialVotingClaim),
};

module.exports = {
  watchedFunctionsMap,
};
