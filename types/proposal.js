const { gql } = require('apollo-server-express');
const BigNumber = require('bignumber.js');

const typeDef = gql`
  # Phases or stages for a proposal
  enum ProposalStageEnum {
    ARCHIVED
    DRAFT
    IDEA
    PROPOSAL
  }

  # Voting rounds for proposal voting
  type Milestone {
    # Description of the milestone
    description: String!

    # Title of the milestone
    title: String!
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
    isClaimed: Boolean

    # A flag to indicate if the proposal was passed
    isPassed: Boolean

    # A flag to indicate if the proposal was funded
    isFunded: Boolean
  }

  type ProposalVersion {
    # The hash of the proposal document
    docIpfsHash: String

    # Date the document is created
    created: Timestamp

    # Expected reward on the completion of the proposal
    finalReward: BigNumber

    # Version title
    title: String

    # Version short description
    description: String

    # Version longer description or details
    details: String

    # Version milestones
    milestones: [Milestone]
  }

  type Proposal {
    # The Eth addrress of the proposal
    proposalId: EthAddress!

    # The Eth address of the proposer
    proposer: EthAddress

    # The Eth address of the endorser
    endorser: EthAddress

    # The current stage of the proposal
    stage: ProposalStageEnum

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

    # Total funding for the proposal
    totalFunding: BigNumber

    # A flag indicating if the proposal is PRL'ed(?)
    isPrl: Boolean

     # A flag indicating if the funding changed
    isFundingChanged: Boolean

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
    currentMilestone: Milestone

    # Proposal's current milestone index
    currentMilestoneIndex: Int

    # Proposal's prior versions
    proposalVersions: [ProposalVersion]
  }
`;

const resolvers = {
  Milestone: {},
  VotingRound: {
    isClaimed(round) {
      return round.claimed;
    },
    isPassed(round) {
      return round.passed;
    },
    isFunded(round) {
      return round.funded;
    },
  },
  Proposal: {
    stage(proposal) {
      return proposal.stage.toUpperCase();
    },
    currentMilestone(proposal) {
      return proposal.milestones[proposal.currentMilestoneIndex];
    },
    currentVotingRound(proposal) {
      return proposal.votingRounds
        ? proposal.votingRounds[proposal.currentVotingRoundIndex] : null;
    },
    milestoneFundings(proposal) {
      return proposal.milestoneFundings
        ? proposal.milestoneFundings.map(funding => new BigNumber(funding)) : [];
    },
  },

};

module.exports = { resolvers, typeDef };
