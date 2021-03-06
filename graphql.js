const ethJsUtil = require('ethereumjs-util');
const { withFilter, AuthenticationError } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');

const { actionableStatus } = require('./helpers/constants');
const { proposalToType, getCurrentActionableStatus } = require('./helpers/utils');

const { getAddressDetails } = require('./dbWrapper/addresses');
const { getDaoInfo } = require('./dbWrapper/dao');

const { pubsub } = require('./pubsub');

const {
  getProposal,
  getSpecialProposal,
  getSpecialProposals,
  getProposals,
} = require('./dbWrapper/proposals');

const { proposalStages } = require('./helpers/constants');

const { typeDef: scalarType, resolvers: scalarResolvers } = require('./types/scalar.js');
const { typeDef: userType, resolvers: userResolvers } = require('./types/user.js');
const { typeDef: proposalType, resolvers: proposalResolvers } = require('./types/proposal.js');
const { typeDef: daoType, resolvers: daoResolvers } = require('./types/dao.js');

const queryType = gql`
  type Query {
    # Find a specific proposal by proposal ID.
    fetchProposal(proposalId: String!): Proposal

    # Get the current user's information.
    fetchCurrentUser: User!

    # Get the current user's information.
    fetchDao: Dao!

    # Find proposals in specific stage
    fetchProposals(stage: String!, onlyActionable: Boolean): [Proposal]
  }
`;

const mutationType = gql`
  type Mutation {
    # Sample mutation just to get a pong.
    ping: String
  }
`;

const subscriptionType = gql`
  type Subscription {
    # Triggers on any submitted proposal.
    proposalSubmitted: Proposal!

    # Triggers on any updates of a proposal.
    proposalUpdated: Proposal!

    # Triggers on any change of the current user.
    userUpdated: User!

    # Triggers on any change in the daoInfo struct
    daoUpdated: Dao!
  }
`;

const filterByCurrentAddress = f => (payload, _variables, context, _operation) => (payload
  ? context.address === f(payload) : false);

const resolvers = {
  Query: {
    fetchProposal: async (_obj, args, _context, _info) => {
      const { proposalId } = args;

      let proposal = await getProposal(proposalId);
      if (!proposal) {
        proposal = await getSpecialProposal(proposalId);
      }

      return proposal ? proposalToType(proposal) : null;
    },
    fetchCurrentUser: (_obj, _args, context, _info) => {
      if (!context.currentUser) {
        throw new Error('Not Authenticated');
      }

      return context.currentUser;
    },
    fetchDao: (_obj, _args, _context, _info) => {
      return getDaoInfo();
    },
    fetchProposals: async (_obj, args, context, _info) => {
      const { stage, onlyActionable } = args;
      const filter = (stage === 'all') ? {} : { stage: stage.toUpperCase() };
      const proposals = await getProposals(filter);
      const specialProposals = (stage.toUpperCase() === proposalStages.PROPOSAL || stage === 'all') ? await getSpecialProposals() : [];

      const allProposals = specialProposals.concat(proposals).map(proposal => ({
        ...proposal,
        actionableStatus: getCurrentActionableStatus(proposal, context.currentUser),
      }));
      return onlyActionable ? allProposals.filter(proposal => proposal.actionableStatus !== actionableStatus.NONE) : allProposals;
    },
  },
  Mutation: {},
  Subscription: {
    userUpdated: {
      subscribe: withFilter(
        (_obj, _args, context, _info) => {
          if (!context.currentUser) {
            throw new Error('Not Authenticated');
          }

          return pubsub.asyncIterator('userUpdated');
        },
        filterByCurrentAddress(payload => payload.userUpdated.address),
      ),
    },
    proposalSubmitted: {
      subscribe: (_obj, _args, context, _info) => {
        if (!context.currentUser) {
          throw new Error('Not Authenticated');
        }

        return pubsub.asyncIterator('proposalSubmitted');
      },
    },
    proposalUpdated: {
      subscribe: (_obj, _args, context, _info) => {
        if (!context.currentUser) {
          throw new Error('Not Authenticated');
        }

        return pubsub.asyncIterator('proposalUpdated');
      },
    },
    daoUpdated: {
      subscribe: () => pubsub.asyncIterator('daoUpdated'),
    },
  },
};

const signatureAuthorization = (params) => {
  const { address, message, signature } = params;

  if (address && message && signature) {
    const { v, r, s } = ethJsUtil.fromRpcSig(signature);

    const prefixedMsg = ethJsUtil.sha3(
      Buffer.concat([
        Buffer.from('\x19Ethereum Signed Message:\n'),
        Buffer.from(String(message.length)),
        Buffer.from(message),
      ]),
    );

    const publicKey = ethJsUtil.ecrecover(prefixedMsg, v, r, s);
    const bufferedAddress = ethJsUtil.pubToAddress(publicKey);
    const recoveredAddress = ethJsUtil.bufferToHex(bufferedAddress);

    const normalizedAddress = address.toLowerCase();

    if (recoveredAddress === normalizedAddress) {
      return getAddressDetails(normalizedAddress)
        .then(userInfo => ({
          address: normalizedAddress,
          currentUser: userInfo,
        }));
    }

    throw new AuthenticationError('Invalid address or signature');
  } else {
    return {};
  }
};

module.exports = new ApolloServer({
  typeDefs: [
    scalarType,
    userType,
    proposalType,
    daoType,
    queryType,
    mutationType,
    subscriptionType,
  ],
  resolvers: {
    ...scalarResolvers,
    ...userResolvers,
    ...proposalResolvers,
    ...daoResolvers,
    ...resolvers,
  },
  context: ({ req, connection }) => {
    if (connection) {
      return connection.context;
    }
    return signatureAuthorization(req.headers);
  },
  subscriptions: {
    path: '/websocket',
    onConnect: (connectionParams, _webSocket) => signatureAuthorization(connectionParams || {}),
  },
});
