const ethJsUtil = require('ethereumjs-util');
const { withFilter } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');

const { proposalToType } = require('./helpers/utils');

const { getAddressDetails } = require('./dbWrapper/addresses');

const { pubsub } = require('./pubsub');

const { getProposal } = require('./dbWrapper/proposals');

const { typeDef: scalarType, resolvers: scalarResolvers } = require('./types/scalar.js');
const { typeDef: userType, resolvers: userResolvers } = require('./types/user.js');
const { typeDef: proposalType, resolvers: proposalResolvers } = require('./types/proposal.js');

const queryType = gql`
  type Query {
    """
    Find a specific proposal by proposal ID.
    """
    fetchProposal(proposalId: String!): Proposal

    """
    Get the current user's information.
    """
    fetchCurrentUser: User!
  }
`;

const mutationType = gql`
  type Mutation {
    """
    Sample mutation just to get a pong.
    """
    ping: String
  }
`;

const subscriptionType = gql`
  type Subscription {
    """
    Triggers on any update of a proposal.
    """
    proposalUpdated: Proposal!

    """
    Triggers on any change of the current user.
    """
    userUpdated: User!
  }
`;

const filterByCurrentAddress = f => (payload, _variables, context, _operation) => context.address === f(payload);

const resolvers = {
  Query: {
    fetchProposal: async (obj, args, _context, _info) => {
      const { proposalId } = args;

      const proposal = await getProposal(proposalId);

      return proposal ? proposalToType(proposal) : null;
    },
    fetchCurrentUser: (_obj, _args, context, _info) => {
      return context.currentUser;
    },
  },
  Mutation: {},
  Subscription: {
    userUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('userUpdated'),
        filterByCurrentAddress(payload => payload.userUpdated.address),
      ),
    },
    proposalUpdated: {
      subscribe: () => pubsub.asyncIterator('proposalUpdated'),
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
    throw new Error('Invalid address or signature');
  } else {
    throw new Error('Missing address or signature');
  }
};

module.exports = new ApolloServer({
  typeDefs: [
    scalarType,
    userType,
    proposalType,
    queryType,
    mutationType,
    subscriptionType,
  ],
  resolvers: {
    ...scalarResolvers,
    ...userResolvers,
    ...proposalResolvers,
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
