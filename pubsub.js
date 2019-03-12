const { PubSub } = require('apollo-server');

const { proposalToType } = require('./helpers/utils');

const pubsub = new PubSub();

const broadcast = {
  userUpdated(user) {
    pubsub.publish(
      'userUpdated',
      { userUpdated: user },
    );
  },
  proposalUpdated(proposal) {
    const proposalObject = proposalToType(proposal);

    pubsub.publish(
      'proposalUpdated',
      { proposalUpdated: proposalObject },
    );
  },
};


module.exports = {
  pubsub,
  broadcast,
};
