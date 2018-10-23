const {
  refreshProposalNew,
  refreshProposalDetails,
  refreshProposalEndorseProposal,
  refreshProposalFinalizeProposal,
  refreshProposalDraftVote,
  refreshProposalDraftVotingClaim,
} = require('./proposals');

const {
  refreshAddress,
} = require('./addresses');

const {
  initDao,
} = require('./dao');

const watchedFunctionsMap = {
  setStartOfFirstQuarter: initDao,
  lockDGD: refreshAddress,
  withdrawDGD: refreshAddress,
  confirmContinueParticipation: refreshAddress,
  redeemBadge: refreshAddress,
  submitPreproposal: refreshProposalNew,
  modifyProposal: refreshProposalDetails,
  endorseProposal: refreshProposalEndorseProposal,
  finalizeProposal: refreshProposalFinalizeProposal,
  voteOnDraft: refreshProposalDraftVote,
  claimDraftVotingResult: refreshProposalDraftVotingClaim,
  // commitVoteOnProposal: refreshProposalCommitVote,
  // revealVoteOnProposal: refreshProposalRevealVote,
  // claimProposalVotingResult: refreshProposalVotingClaim,
  // commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  // revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
};

module.exports = {
  watchedFunctionsMap,
};
