const { PubSub } = require('apollo-server');

const { proposalToType } = require('./helpers/utils');

const pubsub = new PubSub();

const broadcast = {
  userUpdated(user) {
    return pubsub.publish(
      'userUpdated',
      { userUpdated: user },
    );
  },
  proposalSubmitted(proposal) {
    const proposalObject = proposalToType(proposal);

    return pubsub.publish(
      'proposalSubmitted',
      { proposalSubmitted: proposalObject },
    );
  },
  proposalUpdated(proposal) {
    const proposalObject = proposalToType(proposal);

    return pubsub.publish(
      'proposalUpdated',
      { proposalUpdated: proposalObject },
    );
  },
  daoUpdated(daoInfo) {
    return pubsub.publish(
      'daoUpdated',
      { daoUpdated: daoInfo },
    );
  },
};

module.exports = {
  pubsub,
  broadcast,
};
