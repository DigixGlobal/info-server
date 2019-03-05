const { gql } = require('apollo-server-express');

const { ofOne } = require('../helpers/utils');
const { denominators } = require('../helpers/constants');

const typeDef = gql`
  type User {
    # User's ethereum address
    address: EthAddress!

    # User's current stake
    lockedDgdStake: BigNumber

    # User's currently locked DGD
    lockedDgd: BigNumber

    # User's current reputation points
    reputationPoint: BigNumber!

    # User's current quarterly points
    quarterPoint: BigNumber

    # A flag to indicate if the current user is a moderator
    isModerator: Boolean

    # A flag to indicate if the current user is a participant
    isParticipant: Boolean
  }
`;

const dgd = (value) => value ? ofOne(value, denominators.DGD) : null;
const reputation = (value) => value ?  ofOne(value, denominators.REPUTATION_POINT) : null;

const resolvers = {
    User: {
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
            return reputation(user.quarterPoint);
        }
    }
};

module.exports = { resolvers, typeDef };
