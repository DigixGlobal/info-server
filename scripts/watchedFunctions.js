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
  changeFundings: refreshProposalChangeFundings,
  closeProposal: refreshProposalClose,
  founderCloseProposals: refreshProposalsFounderClose,
  updatePRL: refreshProposalPRLAction,
  // special proposal
  createSpecialProposal: refreshProposalSpecialNew,
  startSpecialProposalVoting: refreshProposalSpecial,
  commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
  claimSpecialProposalVotingResult: refreshProposalSpecialVotingClaim,
};

module.exports = {
  watchedFunctionsMap,
};
