const bodyParser = require('body-parser');
const ethJsUtil = require('ethereumjs-util')
const { withFilter } = require('apollo-server');
const { ApolloServer, gql } = require('apollo-server-express');

const { getAddressDetails } = require('./dbWrapper/addresses');
const { getWeb3 } = require('./web3Wrapper/web3Util');

const {pubsub} = require("./pubsub");

const {getProposal} = require('./dbWrapper/proposals');

const { typeDef: scalarType, resolvers: scalarResolvers } = require('./types/scalar.js');
const { typeDef: userType, resolvers: userResolvers } = require('./types/user.js');
const { typeDef: proposalType, resolvers: proposalResolvers } = require('./types/proposal.js');

const queryType = gql`
  type Query {
    currentUser: User!
  }
`;

const mutationType = gql`
  type Mutation {
    ping: String
  }
`;

const subscriptionType = gql`
  type Subscription {
    proposalUpdated: Proposal!
    userUpdated: User!
  }
`;

const filterByCurrentAddress = (f) =>
      (payload, _variables, { connection: { context }}, _operation) => context.address == f(payload)

const resolvers = {
    Query: {
        currentUser: (_obj, _args, context, _info) => {
            return { currentUser: context };
        }
    },
    Mutation: {},
    Subscription: {
        userUpdated: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('userUpdated'),
                filterByCurrentAddress((payload) => payload.userUpdated.address)
            )
        },
        proposalUpdated: {
            subscribe: () => pubsub.asyncIterator('proposalUpdated')
        }
    }
};

module.exports = new ApolloServer({
    typeDefs: [
        scalarType,
        userType,
        proposalType,
        queryType,
        mutationType,
        subscriptionType
    ],
    resolvers: {
        ...scalarResolvers,
        ...userResolvers,
        ...proposalResolvers,
        ...resolvers
    },
    subscriptions: {
        path: '/websocket',
        onConnect: (connectionParams, _webSocket) => {
            const {address, message, signature} = connectionParams;
            const web3 = getWeb3();

            if (address && message && signature) {
                const {v, r, s} = ethJsUtil.fromRpcSig(signature);

                const prefixedMsg = ethJsUtil.sha3(
                    Buffer.concat([
                        Buffer.from("\x19Ethereum Signed Message:\n"),
                        Buffer.from(String(message.length)),
                        Buffer.from(message)
                    ])
                );

                const publicKey = ethJsUtil.ecrecover(prefixedMsg, v, r, s);
                const bufferedAddress = ethJsUtil.pubToAddress(publicKey);
                const recoveredAddress = ethJsUtil.bufferToHex(bufferedAddress);

                const normalizedAddress = address.toLowerCase();

                if (recoveredAddress == normalizedAddress) {
                    return getAddressDetails(normalizedAddress)
                        .then((userInfo) => ({
                            address: normalizedAddress,
                            currentUser: userInfo
                        }));
                } else {
                    throw new Error('Invalid address or signature');
                }
            } else {
                throw new Error('Missing address or signature');
            }
        }
    }
});
