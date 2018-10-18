const {
  refreshProposalNew,
  refreshProposalDetails,
  refreshProposalEndorseProposal,
  refreshProposalFinalizeProposal,
} = require('./proposals');

const {
  refreshAddressLockDGD,
  refreshAddressWithdrawDGD,
  refreshAddressContinueParticipation,
  refreshAddressRedeemBadge,
} = require('./addresses');

const watchedFunctionsMap = {
  // lockDGD: refreshAddressLockDGD,
  // withdrawDGD: refreshAddressWithdrawDGD,
  // confirmContinueParticipation: refreshAddressContinueParticipation,
  // redeemBadge: refreshAddressRedeemBadge,
  submitPreproposal: refreshProposalNew,
  modifyProposal: refreshProposalDetails,
  endorseProposal: refreshProposalEndorseProposal,
  finalizeProposal: refreshProposalFinalizeProposal,
  // voteOnDraft: refreshProposalDraftVote,
  // claimDraftVotingResult: refreshProposalDraftVotingClaim,
  // commitVoteOnProposal: refreshProposalCommitVote,
  // revealVoteOnProposal: refreshProposalRevealVote,
  // claimProposalVotingResult: refreshProposalVotingClaim,
  // commitVoteOnSpecialProposal: refreshProposalCommitVoteOnSpecial,
  // revealVoteOnSpecialProposal: refreshProposalRevealVoteOnSpecial,
};

module.exports = {
  watchedFunctionsMap,
};
