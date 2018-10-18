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

const readProposalVersionIndices = {
  docIpfsHash: 0,
  created: 1,
  milestoneFundings: 2,
  finalReward: 3,
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
  PROPOSALS: 'proposals',
  ADDRESSES: 'addresses',
  DAO: 'daoInfo',
};

const counters = {
  TRANSACTIONS: 'allTransactions',
};

const watchedFunctionNames = {
  NEW_PROPOSAL: 'submitPreproposal',
  ENDORSE_PROPOSAL: 'endorseProposal',
  MODIFY_PROPOSAL: 'modifyProposal',
  FINALIZE_PROPOSAL: 'finalizeProposal',
  // DRAFT_VOTE: 'voteOnDraft',
  // CLAIM_DRAFT_VOTING: 'claimDraftVotingResult',
  // COMMIT_VOTE: 'commitVoteOnProposal',
  // REVEAL_VOTE: 'revealVoteOnProposal',
  // CLAIM_VOTING: 'claimProposalVotingResult',
  // COMMIT_VOTE_SPECIAL: 'commitVoteOnSpecialProposal',
  // REVEAL_VOTE_SPECIAL: 'revealVoteOnSpecialProposal',
};

const watchedFunctionsList = [
  watchedFunctionNames.NEW_PROPOSAL,
  watchedFunctionNames.ENDORSE_PROPOSAL,
  watchedFunctionNames.MODIFY_PROPOSAL,
  watchedFunctionNames.FINALIZE_PROPOSAL,
  // watchedFunctionNames.DRAFT_VOTE,
  // watchedFunctionNames.CLAIM_DRAFT_VOTING,
  // watchedFunctionNames.COMMIT_VOTE,
  // watchedFunctionNames.REVEAL_VOTE,
  // watchedFunctionNames.CLAIM_VOTING,
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
  readProposalVersionIndices,
  daoConfigsKeys,
  proposalStages,
  collections,
  counters,
  proposalVotingStages,
  watchedFunctionNames,
  watchedFunctionsList,
};
