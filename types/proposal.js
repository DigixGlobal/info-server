const { gql } = require('apollo-server-express');
const BigNumber = require('bignumber.js');

const { ofOne } = require('../helpers/utils');
const { denominators } = require('../helpers/constants');

const typeDef = gql`
  # Voting rounds for proposal voting
  type Milestone {
    # Description of the milestone
    description: String

    # Title of the milestone
    title: String
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
    # Detail title
    title: String

    # Detail short description
    description: String

    # Detail longer description or details
    details: String

    # Detail milestones
    milestones: [Milestone]

    # Detail images
    images: [String]
  }

  type ProposalVersion {
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

    # Proposal's title
    title: String

    # Proposal's short description
    description: String

    # Proposal's longer description or details
    details: String

    # Milestone fundings
    milestoneFundings: [BigNumber]

    # See 'ProposalVersion.totalFunding'
    totalFunding: BigNumber

    # A flag indicating if the proposal is PRL'ed(?)
    isPrl: Boolean

     # A flag indicating if the funding changed
    isFundingChanged: Boolean

    # Changes in milestone funding
    changedFundings: MilestoneFunding

    # Proposal's current voting round index
    currentVotingRoundIndex: Int

    # Proposal's current voting round index
    currentVotingRound: VotingRound

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
  }
`;

const dgd = value => (value === null || value === undefined ? null : ofOne(value, denominators.DGD));

const resolvers = {
  Milestone: {},
  VotingRound: { },
  ProposalVersion: {
    milestoneFundings(version) {
      return version.milestoneFundings
        .map(funding => new BigNumber(funding));
    },
  },
  Proposal: {
    isPrl(proposal) {
      return proposal.prl;
    },
    currentMilestoneDetails(proposal) {
      return proposal.milestones[proposal.currentMilestone];
    },
    currentVotingRound(proposal) {
      return proposal.votingRounds
        ? proposal.votingRounds[proposal.currentVotingRoundIndex] : null;
    },
    milestoneFundings(proposal) {
      return proposal.milestoneFundings
        ? proposal.milestoneFundings.map(funding => new BigNumber(funding)) : [];
    },
    claimableFunding(proposal) {
      return dgd(proposal.claimableFunding);
    },
  },

};

module.exports = { resolvers, typeDef };
