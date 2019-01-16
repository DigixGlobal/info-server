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
  refreshProposalClose,
  refreshProposalsFounderClose,
  refreshProposalPRLAction,
  // refreshProposalCommitVoteOnSpecial,
  // refreshProposalRevealVoteOnSpecial,
} = require('./proposals');

const {
  refreshAddress,
} = require('./addresses');

const {
  initDao,
} = require('./dao');

const watchedFunctionsMap = {
  setStartOfFirstQuarter: initDao,
  calculateGlobalRewardsBeforeNewQuarter: initDao,
  lockDGD: refreshAddress,
  withdrawDGD: refreshAddress,
  confirmContinueParticipation: refreshAddress,
  redeemBadge: refreshAddress,
  claimRewards: refreshAddress,
  submitPreproposal: refreshProposalNew,
  modifyProposal: refreshProposalDetails,
  endorseProposal: refreshProposalEndorseProposal,
  finalizeProposal: refreshProposalFinalizeProposal,
  voteOnDraft: refreshProposalDraftVote,
  claimDraftVotingResult: refreshProposalDraftVotingClaim,
  commitVoteOnProposal: refreshProposalCommitVote,
  revealVoteOnProposal: refreshProposalRevealVote,
  claimProposalVotingResult: refreshProposalVotingClaim,
  claimFunding: refreshProposalClaimFunding,
  finishMilestone: refreshProposalFinishMilestone,
  closeProposal: refreshProposalClose,
  founderCloseProposals: refreshProposalsFounderClose,
  updatePRL: refreshProposalPRLAction,
  // commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  // revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
};

module.exports = {
  watchedFunctionsMap,
};
