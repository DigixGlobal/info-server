const { gql } = require('apollo-server-express');

const typeDef = gql`
  type Dao {
    # Current quarter number in DigixDAO
    currentQuarter: BigNumber

    # Timestamp for start of the current quarter
    startOfQuarter: BigNumber

    # Timestamp for start of main phase of current quarter
    startOfMainphase: BigNumber

    # Timestamp for start of the next quarter
    startOfNextQuarter: BigNumber

    # Total number of DGDs locked into DigixDAO by participants
    totalLockedDgds: BigNumber

    # Total number of DGDs locked into DigixDAO by Moderators only
    totalModeratorLockedDgds: BigNumber

    # Number of moderators in DigixDAO
    nModerators: BigNumber

    # Number of participants in DigixDAO
    nParticipants: BigNumber
  }
`;

const resolvers = {
  Dao: {
    totalLockedDgds(daoInfo) {
      return daoInfo.totalLockedDgds;
    },
    totalModeratorLockedDgds(daoInfo) {
      return daoInfo.totalModeratorLockedDgds;
    },
  },
};

module.exports = { resolvers, typeDef };
