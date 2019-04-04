const { gql } = require('apollo-server-express');

const { ofOne } = require('../helpers/utils');
const { denominators } = require('../helpers/constants');

const typeDef = gql`
  type User {
    # User's id
    id: String!

    # User's ethereum address
    address: EthAddress!

    # User's current stake
    lockedDgdStake: BigNumber

    # User's current claimable DGX
    claimableDgx: BigNumber

    # User's currently locked DGD
    lockedDgd: BigNumber

    # User's current reputation points
    reputationPoint: BigNumber

    # User's current quarterly points
    quarterPoint: BigNumber

    # User's current moderator quarter points
    moderatorQuarterPoint: BigNumber

    # A flag to indicate if the current user is a moderator
    isModerator: Boolean

    # A flag to indicate if the current user is a participant
    isParticipant: Boolean
  }
`;

const dgd = value => (value === null || value === undefined ? null : ofOne(value, denominators.DGD));
const dgx = value => (value === null || value === undefined ? null : ofOne(value, denominators.DGX));
const reputation = value => (value ? ofOne(value, denominators.REPUTATION_POINT) : null);
const quarterPoint = value => (value ? ofOne(value, denominators.QUARTER_POINT) : null);

const resolvers = {
  User: {
    id(user) {
      return user.address;
    },
    claimableDgx(user) {
      return dgx(user.claimableDgx);
    },
    lockedDgdStake(user) {
      return dgd(user.lockedDgdStake);
    },
    lockedDgd(user) {
      return dgd(user.lockedDgd);
    },
    reputationPoint(user) {
      return reputation(user.reputationPoint);
    },
    quarterPoint(user) {
      return quarterPoint(user.quarterPoint);
    },
    moderatorQuarterPoint(user) {
      return quarterPoint(user.moderatorQuarterPoint);
    },
  },
};

module.exports = { resolvers, typeDef };
