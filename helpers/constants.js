const readProposalIndices = {
  proposalId: 0,
  proposer: 1,
  endorser: 2,
  stage: 3,
  timeCreated: 4,
  nVersions: 5,
  latestVersionDoc: 6,
  finalVersionIpfsDoc: 7,
  prl: 8,
  isDigix: 9,
};

const daoConfigsIndices = {
  CONFIG_LOCKING_PHASE_DURATION: 0,
  CONFIG_QUARTER_DURATION: 1,
  CONFIG_VOTING_COMMIT_PHASE: 2,
  CONFIG_VOTING_PHASE_TOTAL: 3,
  CONFIG_INTERIM_COMMIT_PHASE: 4,
  CONFIG_INTERIM_PHASE_TOTAL: 5,
  CONFIG_DRAFT_QUORUM_FIXED_PORTION_NUMERATOR: 6,
  CONFIG_DRAFT_QUORUM_FIXED_PORTION_DENOMINATOR: 7,
  CONFIG_DRAFT_QUORUM_SCALING_FACTOR_NUMERATOR: 8,
  CONFIG_DRAFT_QUORUM_SCALING_FACTOR_DENOMINATOR: 9,
  CONFIG_VOTING_QUORUM_FIXED_PORTION_NUMERATOR: 10,
  CONFIG_VOTING_QUORUM_FIXED_PORTION_DENOMINATOR: 11,
  CONFIG_VOTING_QUORUM_SCALING_FACTOR_NUMERATOR: 12,
  CONFIG_VOTING_QUORUM_SCALING_FACTOR_DENOMINATOR: 13,
  CONFIG_DRAFT_QUOTA_NUMERATOR: 14,
  CONFIG_DRAFT_QUOTA_DENOMINATOR: 15,
  CONFIG_VOTING_QUOTA_NUMERATOR: 16,
  CONFIG_VOTING_QUOTA_DENOMINATOR: 17,
  CONFIG_QUARTER_POINT_DRAFT_VOTE: 18,
  CONFIG_QUARTER_POINT_VOTE: 19,
  CONFIG_QUARTER_POINT_INTERIM_VOTE: 20,
  CONFIG_MINIMAL_QUARTER_POINT: 21,
  CONFIG_QUARTER_POINT_MILESTONE_COMPLETION_PER_10000ETH: 22,
  CONFIG_BONUS_REPUTATION_NUMERATOR: 23,
  CONFIG_BONUS_REPUTATION_DENOMINATOR: 24,
  CONFIG_SPECIAL_PROPOSAL_COMMIT_PHASE: 25,
  CONFIG_SPECIAL_PROPOSAL_PHASE_TOTAL: 26,
  CONFIG_SPECIAL_QUOTA_NUMERATOR: 27,
  CONFIG_SPECIAL_QUOTA_DENOMINATOR: 28,
  CONFIG_SPECIAL_PROPOSAL_QUORUM_NUMERATOR: 29,
  CONFIG_SPECIAL_PROPOSAL_QUORUM_DENOMINATOR: 30,
  CONFIG_MAXIMUM_REPUTATION_DEDUCTION: 31,
  CONFIG_PUNISHMENT_FOR_NOT_LOCKING: 32,
  CONFIG_REPUTATION_PER_EXTRA_QP_NUM: 33,
  CONFIG_REPUTATION_PER_EXTRA_QP_DEN: 34,
  CONFIG_QUARTER_POINT_SCALING_FACTOR: 35,
  CONFIG_REPUTATION_POINT_SCALING_FACTOR: 36,
  CONFIG_MODERATOR_MINIMAL_QUARTER_POINT: 37,
  CONFIG_MODERATOR_QUARTER_POINT_SCALING_FACTOR: 38,
  CONFIG_MODERATOR_REPUTATION_POINT_SCALING_FACTOR: 39,
  CONFIG_PORTION_TO_MODERATORS_NUM: 40,
  CONFIG_PORTION_TO_MODERATORS_DEN: 41,
  CONFIG_DRAFT_VOTING_PHASE: 42,
  CONFIG_REPUTATION_POINT_BOOST_FOR_BADGE: 43,
  CONFIG_FINAL_REWARD_SCALING_FACTOR_NUMERATOR: 44,
  CONFIG_FINAL_REWARD_SCALING_FACTOR_DENOMINATOR: 45,
  CONFIG_MAXIMUM_MODERATOR_REPUTATION_DEDUCTION: 46,
  CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_NUM: 47,
  CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_DEN: 48,
  CONFIG_VOTE_CLAIMING_DEADLINE: 49,
  CONFIG_MINIMUM_LOCKED_DGD: 50,
  CONFIG_MINIMUM_DGD_FOR_MODERATOR: 51,
  CONFIG_MINIMUM_REPUTATION_FOR_MODERATOR: 52,
  CONFIG_PREPROPOSAL_COLLATERAL: 53,
  CONFIG_MAX_FUNDING_FOR_NON_DIGIX: 54,
  CONFIG_MAX_MILESTONES_FOR_NON_DIGIX: 55,
  CONFIG_NON_DIGIX_PROPOSAL_CAP_PER_QUARTER: 56,
  CONFIG_PROPOSAL_DEAD_DURATION: 57,
  CONFIG_CARBON_VOTE_REPUTATION_BONUS: 58,
};

const readProposalVersionIndices = {
  docIpfsHash: 0,
  created: 1,
  milestoneFundings: 2,
  finalReward: 3,
};

const readProposalPRLActions = {
  1: 'stopped',
  2: 'paused',
  3: 'ok',
};

const proposalStages = {
  IDEA: 'idea',
  DRAFT: 'draft',
  PROPOSAL: 'proposal',
  ONGOING: 'ongoing',
  REVIEW: 'review',
  ARCHIVED: 'archived',
};

const proposalVotingStages = {
  DRAFT: 'draftVoting',
  COMMIT: 'commit',
  REVEAL: 'reveal',
  NONE: 'none',
};

const collections = {
  COUNTERS: 'counters',
  TRANSACTIONS: 'allTransactions',
  PENDING_TRANSACTIONS: 'pendingTransactions',
  PROPOSALS: 'proposals',
  ADDRESSES: 'addresses',
  DAO: 'daoInfo',
  DAO_CONFIGS: 'daoConfigs',
};

const counters = {
  TRANSACTIONS: 'allTransactions',
  NONCE: 'nonce',
};

const denominators = {
  DGD: 1e9,
  DGX: 1e9,
  ETH: 1e18,
  REPUTATION_POINT: 1,
  QUARTER_POINT: 1,
};

const watchedFunctionNames = {
  START_DAO: 'setStartOfFirstQuarter',
  LOCK_DGD: 'lockDGD',
  WITHDRAW_DGD: 'withdrawDGD',
  REDEEM_BADGE: 'redeemBadge',
  CONFIRM_CONTINUE_PARTICIPATION: 'confirmContinueParticipation',
  NEW_PROPOSAL: 'submitPreproposal',
  ENDORSE_PROPOSAL: 'endorseProposal',
  MODIFY_PROPOSAL: 'modifyProposal',
  FINALIZE_PROPOSAL: 'finalizeProposal',
  DRAFT_VOTE: 'voteOnDraft',
  CLAIM_DRAFT_VOTING: 'claimDraftVotingResult',
  COMMIT_VOTE: 'commitVoteOnProposal',
  REVEAL_VOTE: 'revealVoteOnProposal',
  CLAIM_VOTING: 'claimProposalVotingResult',
  CLAIM_FUNDING: 'claimFunding',
  FINISH_MILESTONE: 'finishMilestone',
  CLOSE_PROPOSAL: 'closeProposal',
  FOUNDER_CLOSE_PROPOSALS: 'founderCloseProposals',
  PRL_ACTION: 'updatePRL',
  // COMMIT_VOTE_SPECIAL: 'commitVoteOnSpecialProposal',
  // REVEAL_VOTE_SPECIAL: 'revealVoteOnSpecialProposal',
};

const watchedFunctionsList = [
  watchedFunctionNames.START_DAO,
  watchedFunctionNames.LOCK_DGD,
  watchedFunctionNames.WITHDRAW_DGD,
  watchedFunctionNames.REDEEM_BADGE,
  watchedFunctionNames.CONFIRM_CONTINUE_PARTICIPATION,
  watchedFunctionNames.NEW_PROPOSAL,
  watchedFunctionNames.ENDORSE_PROPOSAL,
  watchedFunctionNames.MODIFY_PROPOSAL,
  watchedFunctionNames.FINALIZE_PROPOSAL,
  watchedFunctionNames.DRAFT_VOTE,
  watchedFunctionNames.CLAIM_DRAFT_VOTING,
  watchedFunctionNames.COMMIT_VOTE,
  watchedFunctionNames.REVEAL_VOTE,
  watchedFunctionNames.CLAIM_VOTING,
  watchedFunctionNames.CLAIM_FUNDING,
  watchedFunctionNames.FINISH_MILESTONE,
  watchedFunctionNames.CLOSE_PROPOSAL,
  watchedFunctionNames.FOUNDER_CLOSE_PROPOSALS,
  watchedFunctionNames.PRL_ACTION,
  // watchedFunctionNames.COMMIT_VOTE_SPECIAL,
  // watchedFunctionNames.REVEAL_VOTE_SPECIAL,
];

const daoConfigsKeys = {
  CONFIG_LOCKING_PHASE_DURATION: 'locking_phase_duration',
  CONFIG_QUARTER_DURATION: 'quarter_duration',
  CONFIG_VOTING_COMMIT_PHASE: 'voting_commit_phase',
  CONFIG_VOTING_PHASE_TOTAL: 'voting_phase_total',
  CONFIG_INTERIM_COMMIT_PHASE: 'interim_voting_commit_phase',
  CONFIG_INTERIM_PHASE_TOTAL: 'interim_voting_phase_total',
  CONFIG_DRAFT_QUORUM_FIXED_PORTION_NUMERATOR: 'draft_quorum_fixed_numerator',
  CONFIG_DRAFT_QUORUM_FIXED_PORTION_DENOMINATOR: 'draft_quorum_fixed_denominator',
  CONFIG_DRAFT_QUORUM_SCALING_FACTOR_NUMERATOR: 'draft_quorum_sfactor_numerator',
  CONFIG_DRAFT_QUORUM_SCALING_FACTOR_DENOMINATOR: 'draft_quorum_sfactor_denominator',
  CONFIG_VOTING_QUORUM_FIXED_PORTION_NUMERATOR: 'vote_quorum_fixed_numerator',
  CONFIG_VOTING_QUORUM_FIXED_PORTION_DENOMINATOR: 'vote_quorum_fixed_denominator',
  CONFIG_VOTING_QUORUM_SCALING_FACTOR_NUMERATOR: 'vote_quorum_sfactor_numerator',
  CONFIG_VOTING_QUORUM_SCALING_FACTOR_DENOMINATOR: 'vote_quorum_sfactor_denominator',
  CONFIG_DRAFT_QUOTA_NUMERATOR: 'draft_quota_numerator',
  CONFIG_DRAFT_QUOTA_DENOMINATOR: 'draft_quota_denominator',
  CONFIG_VOTING_QUOTA_NUMERATOR: 'voting_quota_numerator',
  CONFIG_VOTING_QUOTA_DENOMINATOR: 'voting_quota_denominator',
  CONFIG_MINIMAL_QUARTER_POINT: 'minimal_qp',
  CONFIG_QUARTER_POINT_SCALING_FACTOR: 'quarter_point_scaling_factor',
  CONFIG_REPUTATION_POINT_SCALING_FACTOR: 'rep_point_scaling_factor',
  CONFIG_MODERATOR_MINIMAL_QUARTER_POINT: 'minimal_mod_qp',
  CONFIG_MODERATOR_QUARTER_POINT_SCALING_FACTOR: 'mod_qp_scaling_factor',
  CONFIG_MODERATOR_REPUTATION_POINT_SCALING_FACTOR: 'mod_rep_point_scaling_factor',
  CONFIG_QUARTER_POINT_DRAFT_VOTE: 'quarter_point_draft_vote',
  CONFIG_QUARTER_POINT_VOTE: 'quarter_point_vote',
  CONFIG_QUARTER_POINT_INTERIM_VOTE: 'quarter_point_interim_vote',
  CONFIG_QUARTER_POINT_CLAIM_RESULT: 'quarter_point_claim_result',
  CONFIG_QUARTER_POINT_MILESTONE_COMPLETION_PER_10000ETH: 'q_p_milestone_completion',
  CONFIG_BONUS_REPUTATION_NUMERATOR: 'bonus_reputation_numerator',
  CONFIG_BONUS_REPUTATION_DENOMINATOR: 'bonus_reputation_denominator',
  CONFIG_SPECIAL_PROPOSAL_COMMIT_PHASE: 'special_proposal_commit_phase',
  CONFIG_SPECIAL_PROPOSAL_PHASE_TOTAL: 'special_proposal_phase_total',
  CONFIG_SPECIAL_QUOTA_NUMERATOR: 'config_special_quota_numerator',
  CONFIG_SPECIAL_QUOTA_DENOMINATOR: 'config_special_quota_denominator',
  CONFIG_SPECIAL_PROPOSAL_QUORUM_NUMERATOR: 'special_quorum_numerator',
  CONFIG_SPECIAL_PROPOSAL_QUORUM_DENOMINATOR: 'special_quorum_denominator',
  CONFIG_MAXIMUM_REPUTATION_DEDUCTION: 'config_max_reputation_deduction',
  CONFIG_PUNISHMENT_FOR_NOT_LOCKING: 'config_punishment_not_locking',
  CONFIG_REPUTATION_PER_EXTRA_QP_NUM: 'config_rep_per_extra_qp_num',
  CONFIG_REPUTATION_PER_EXTRA_QP_DEN: 'config_rep_per_extra_qp_den',
  CONFIG_PORTION_TO_MODERATORS_NUM: 'config_mod_portion_num',
  CONFIG_PORTION_TO_MODERATORS_DEN: 'config_mod_portion_den',
  CONFIG_DRAFT_VOTING_PHASE: 'config_draft_voting_phase',
  CONFIG_REPUTATION_POINT_BOOST_FOR_BADGE: 'config_rp_boost_per_badge',
  CONFIG_FINAL_REWARD_SCALING_FACTOR_NUMERATOR: 'final_reward_sfactor_numerator',
  CONFIG_FINAL_REWARD_SCALING_FACTOR_DENOMINATOR: 'final_reward_sfactor_denominator',
  CONFIG_MAXIMUM_MODERATOR_REPUTATION_DEDUCTION: 'config_max_m_rp_deduction',
  CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_NUM: 'config_rep_per_extra_m_qp_num',
  CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_DEN: 'config_rep_per_extra_m_qp_den',
  CONFIG_VOTE_CLAIMING_DEADLINE: 'config_claiming_deadline',
  CONFIG_MINIMUM_LOCKED_DGD: 'min_dgd_participant',
  CONFIG_MINIMUM_DGD_FOR_MODERATOR: 'min_dgd_moderator',
  CONFIG_MINIMUM_REPUTATION_FOR_MODERATOR: 'min_reputation_moderator',
  CONFIG_NON_DIGIX_PROPOSAL_CAP_PER_QUARTER: 'config_nonDigix_proposal_cap',
  CONFIG_MAX_FUNDING_FOR_NON_DIGIX: 'config_max_funding_nonDigix',
  CONFIG_MAX_MILESTONES_FOR_NON_DIGIX: 'config_max_milestones_nonDigix',
  CONFIG_PROPOSAL_DEAD_DURATION: 'config_dead_duration',
  CONFIG_PREPROPOSAL_DEPOSIT: 'config_preproposal_deposit',
};

module.exports = {
  readProposalIndices,
  daoConfigsIndices,
  readProposalVersionIndices,
  daoConfigsKeys,
  proposalStages,
  collections,
  counters,
  proposalVotingStages,
  watchedFunctionNames,
  watchedFunctionsList,
  readProposalPRLActions,
  denominators,
};
