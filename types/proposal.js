const { gql } = require('apollo-server-express');

const { ofOne } = require('../helpers/utils');
const { denominators } = require('../helpers/constants');

const typeDef = gql`
  # Voting rounds for proposal voting
  type Milestone {
    # Index ID
    id: ID!

    # Title of the milestone
    title: String

    # Description of the milestone
    description: String

    # Fund of the milestone
    fund: String
  }

  # Changes in milestone
  type MilestoneChange {
    # Original value
    original: BigNumber

    # Updated value
    updated: BigNumber
  }

  # Milestone fundings
  type MilestoneFunding {
    # Index ID
    id: ID!

    # Milestone changes
    milestones: [MilestoneChange]

    # Milestone reward
    finalReward: MilestoneChange
  }

  type VotingRound {
    # The proposals current claim step
    currentClaimStep: Int

    # Reveal stage deadline
    startTime: Timestamp

    # Reveal stage deadline
    revealDeadline: Timestamp

    # Commit stage deadline
    commitDeadline: Timestamp

    # Draft voting stage deadline
    votingDeadline: Timestamp

    # The total number of commits for this round
    totalCommitCount: BigNumber

    # The total number of voters for this round
    totalVoterCount: BigNumber

    # The total number of stake for this round
    totalVoterStake: BigNumber

    # Stacked DGXs that were voted voted yes
    yes: BigNumber

    # Stacked DGXs that were voted voted no
    no: BigNumber

    # The current quorum of the round
    quorum: BigNumber

    # The current quota of the round
    quota: BigNumber

    # A flag to indicate if the proposal was claimed
    claimed: Boolean

    # A flag to indicate if the proposal was passed
    passed: Boolean

    # A flag to indicate if the proposal was funded
    funded: Boolean
  }

  type ProposalDetail {
    # Index ID
    id: ID!

    # Detail title
    title: String

    # Detail short description
    description: String

    # Detail longer description or details
    details: String

    # Detail milestones
    milestones: [Milestone]

    # Expected reward on the completion of the proposal
    finalReward: String

    # Detail images
    images: [String]
  }

  type ProposalVersion {
    # Index ID
    id: ID!

    # The hash of the proposal document
    docIpfsHash: String

    # Date the document is created
    created: Timestamp

    # Milestone fundings
    milestoneFundings: [BigNumber]

    # Expected reward on the completion of the proposal
    finalReward: BigNumber

    # More docs(?)
    moreDocs: [String]

    # Version total funding
    totalFunding: BigNumber

    # Proposal details
    dijixObject: ProposalDetail

    # See 'ProposalDetail.title'
    title: String

    # See 'ProposalDetail.description'
    description: String

    # See 'ProposalDetail.details'
    details: String

    # See 'ProposalDetail.milestones'
    milestones: [Milestone]
  }

  # Speical proposal configurations
  type UintConfig {
    CONFIG_LOCKING_PHASE_DURATION: String
    CONFIG_QUARTER_DURATION: String
    CONFIG_VOTING_COMMIT_PHASE: String
    CONFIG_VOTING_PHASE_TOTAL: String
    CONFIG_INTERIM_COMMIT_PHASE: String
    CONFIG_INTERIM_PHASE_TOTAL: String
    CONFIG_DRAFT_QUORUM_FIXED_PORTION_NUMERATOR: String
    CONFIG_DRAFT_QUORUM_FIXED_PORTION_DENOMINATOR: String
    CONFIG_DRAFT_QUORUM_SCALING_FACTOR_NUMERATOR: String
    CONFIG_DRAFT_QUORUM_SCALING_FACTOR_DENOMINATOR: String
    CONFIG_VOTING_QUORUM_FIXED_PORTION_NUMERATOR: String
    CONFIG_VOTING_QUORUM_FIXED_PORTION_DENOMINATOR: String
    CONFIG_VOTING_QUORUM_SCALING_FACTOR_NUMERATOR: String
    CONFIG_VOTING_QUORUM_SCALING_FACTOR_DENOMINATOR: String
    CONFIG_DRAFT_QUOTA_NUMERATOR: String
    CONFIG_DRAFT_QUOTA_DENOMINATOR: String
    CONFIG_VOTING_QUOTA_NUMERATOR: String
    CONFIG_VOTING_QUOTA_DENOMINATOR: String
    CONFIG_QUARTER_POINT_DRAFT_VOTE: String
    CONFIG_QUARTER_POINT_VOTE: String
    CONFIG_QUARTER_POINT_INTERIM_VOTE: String
    CONFIG_MINIMAL_QUARTER_POINT: String
    CONFIG_QUARTER_POINT_MILESTONE_COMPLETION_PER_10000ETH: String
    CONFIG_BONUS_REPUTATION_NUMERATOR: String
    CONFIG_BONUS_REPUTATION_DENOMINATOR: String
    CONFIG_SPECIAL_PROPOSAL_COMMIT_PHASE: String
    CONFIG_SPECIAL_PROPOSAL_PHASE_TOTAL: String
    CONFIG_SPECIAL_QUOTA_NUMERATOR: String
    CONFIG_SPECIAL_QUOTA_DENOMINATOR: String
    CONFIG_SPECIAL_PROPOSAL_QUORUM_NUMERATOR: String
    CONFIG_SPECIAL_PROPOSAL_QUORUM_DENOMINATOR: String
    CONFIG_MAXIMUM_REPUTATION_DEDUCTION: String
    CONFIG_PUNISHMENT_FOR_NOT_LOCKING: String
    CONFIG_REPUTATION_PER_EXTRA_QP_NUM: String
    CONFIG_REPUTATION_PER_EXTRA_QP_DEN: String
    CONFIG_QUARTER_POINT_SCALING_FACTOR: String
    CONFIG_REPUTATION_POINT_SCALING_FACTOR: String
    CONFIG_MODERATOR_MINIMAL_QUARTER_POINT: String
    CONFIG_MODERATOR_QUARTER_POINT_SCALING_FACTOR: String
    CONFIG_MODERATOR_REPUTATION_POINT_SCALING_FACTOR: String
    CONFIG_PORTION_TO_MODERATORS_NUM: String
    CONFIG_PORTION_TO_MODERATORS_DEN: String
    CONFIG_DRAFT_VOTING_PHASE: String
    CONFIG_REPUTATION_POINT_BOOST_FOR_BADGE: String
    CONFIG_FINAL_REWARD_SCALING_FACTOR_NUMERATOR: String
    CONFIG_FINAL_REWARD_SCALING_FACTOR_DENOMINATOR: String
    CONFIG_MAXIMUM_MODERATOR_REPUTATION_DEDUCTION: String
    CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_NUM: String
    CONFIG_REPUTATION_PER_EXTRA_MODERATOR_QP_DEN: String
    CONFIG_VOTE_CLAIMING_DEADLINE: String
    CONFIG_MINIMUM_LOCKED_DGD: String
    CONFIG_MINIMUM_DGD_FOR_MODERATOR: String
    CONFIG_MINIMUM_REPUTATION_FOR_MODERATOR: String
    CONFIG_PREPROPOSAL_COLLATERAL: String
    CONFIG_MAX_FUNDING_FOR_NON_DIGIX: String
    CONFIG_MAX_MILESTONES_FOR_NON_DIGIX: String
    CONFIG_NON_DIGIX_PROPOSAL_CAP_PER_QUARTER: String
    CONFIG_PROPOSAL_DEAD_DURATION: String
    CONFIG_CARBON_VOTE_REPUTATION_BONUS: String
  }

  type Proposal {
    # Make 'proposalId' as the 'id'
    id: EthAddress!

    # The Eth address of the proposal
    proposalId: EthAddress!

    # The Eth address of the proposer
    proposer: EthAddress

    # The Eth address of the endorser
    endorser: EthAddress

    # The current stage of the proposal
    stage: String

    # A flag to indicate the proposal is by the Digix
    isDigix: Boolean

    # Milestone fundings
    milestoneFundings: [BigNumber]

     # A flag indicating if the funding changed
    isFundingChanged: Boolean

    # Changes in milestone funding
    changedFundings: MilestoneFunding

    # Proposal's current voting round index
    currentVotingRound: Int

    # Proposal's voting round
    draftVoting: VotingRound

    # Proposal's voting round
    votingRounds: [VotingRound]

    # Proposal's milestones
    milestones: [Milestone]

    # Proposal's current milestone
    currentMilestoneDetails: Milestone

    # Proposal's current milestone index
    currentMilestone: Int

    # Proposal's milestone index
    currentMilestoneIndex: Int

    # Proposal's milestone start
    currentMilestoneStart: Int

    # Proposal's prior versions
    proposalVersions: [ProposalVersion]

    # See 'ProposalVersion.created'
    timeCreated: Timestamp

    # See 'ProposalVersion.docIpfsHash'
    finalVersionIpfsDoc: String

    # See 'Proposal.isPrl'
    prl: Boolean

    # Proposal's claimable funding
    claimableFunding: BigNumber

    # Current voting stage
    votingStage: String

    # For special proposals, the title of the proposal
    title: String

    # A flag indicating if the proposal is active
    isActive: Boolean

    # A flag indicating if the proposal is special
    isSpecial: Boolean

    # Special proposal config changes
    uintConfigs: UintConfig
  }
`;

const dgd = value => (value === null || value === undefined ? null : ofOne(value, denominators.DGD));
const eth = value => (value === null || value === undefined ? null : ofOne(value, denominators.ETH));

const resolvers = {
  VotingRound: {
    quorum(round) {
      return dgd(round.quorum);
    },
    yes(round) {
      return dgd(round.yes);
    },
    no(round) {
      return dgd(round.no);
    },
    totalVoterStake(round) {
      return dgd(round.totalVoterStake);
    },
  },
  ProposalDetail: {
    milestones(detail) {
      return (detail.milestones || []).map((milestone, index) => ({
        id: `${detail.id}/MILESTONE-${index}`,
        ...milestone,
      }));
    },
  },
  ProposalVersion: {
    milestoneFundings(version) {
      return version.milestoneFundings
        .map(eth);
    },
    finalReward(version) {
      return eth(version.finalReward);
    },
    totalFunding(version) {
      return eth(version.totalFunding);
    },
    dijixObject(version) {
      return {
        id: `${version.id}/DIJIX`,
        ...version.dijixObject,
      };
    },
  },
  Proposal: {
    id(proposal) {
      return proposal.proposalId;
    },
    claimableFunding(proposal) {
      return eth(proposal.claimableFunding);
    },
    proposalVersions(proposal) {
      return (proposal.proposalVersions || []).map((version, index) => ({
        id: `${proposal.proposalId}/VERSION-${index}`,
        ...version,
      }));
    },
  },

};

module.exports = { resolvers, typeDef };
