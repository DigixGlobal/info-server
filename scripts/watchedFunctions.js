const {pubsub} = require("../pubsub");

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

const broadcastUpdatedUser = (f) => (...args) =>
      f(...args).then((user) => {
          pubsub.publish(
              "userUpdated",
              {userUpdated: user}
          );

          return user;
      });

const broadcastUpdatedProposal = (f) => (...args) =>
      f(...args).then((proposal) => {
          if (proposal) {
              const currentVersion = proposal.proposalVersions.slice(-1)[0];
              const { dijixObject: proposalDetails, totalFunding } = currentVersion;
              const {
                  prl: isPrl,
                  currentMilestone: currentMilestoneIndex,
                  currentVotingRound: currentVotingRoundIndex,
                  proposalVersions,
                  ...baseProposal
              } = proposal;

              const normalizedProposal = {
                  ...baseProposal,
                  isPrl,
                  currentMilestoneIndex,
                  currentVotingRoundIndex,
                  proposalVersions: proposalVersions
                      .map(({dijixObject, ...baseVersion}) => ({
                          ...baseVersion,
                          ...dijixObject
                      })),
                  totalFunding,
                  ...proposalDetails
              };

              pubsub.publish(
                  "proposalUpdated",
                  {proposalUpdated: normalizedProposal}
              );
          }

          return proposal;
      });

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
    revealVoteOnProposal: broadcastUpdatedProposal(refreshProposalRevealVote),
    claimProposalVotingResult: broadcastUpdatedProposal(refreshProposalVotingClaim),
    claimFunding: broadcastUpdatedProposal(refreshProposalClaimFunding),
    finishMilestone: broadcastUpdatedProposal(refreshProposalFinishMilestone),
    changeFundings: broadcastUpdatedProposal(refreshProposalChangeFundings),
    closeProposal: broadcastUpdatedProposal(refreshProposalClose),
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
