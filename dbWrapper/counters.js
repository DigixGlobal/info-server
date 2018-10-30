const mongoUtil = require('./mongoUtil');

const {
  collections,
  counters,
} = require('../helpers/constants');

const getCounter = async (name) => {
  const counter = await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOne({ name });
  return counter;
};

const incrementAndGetSelfNonce = async () => {
  const nonce = await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOneAndUpdate({
      name: counters.NONCE,
    }, {
      $inc: {
        self: 1,
      },
    }, { returnOriginal: false });
  return nonce.value.self;
};

const getDaoServerNonce = async () => {
  const nonce = await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOne({ name: counters.NONCE });
  return nonce.daoServer;
};

const setDaoServerNonce = async (nonce) => {
  await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .updateOne({
      name: counters.NONCE,
    }, {
      $set: {
        daoServer: nonce,
      },
    });
};

const incrementMaxValue = async (name, incrementBy) => {
  await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOneAndUpdate({
      name,
    }, {
      $inc: {
        max_value: incrementBy,
      },
    });
};

const incrementLastProcessed = async (name, incrementBy) => {
  await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOneAndUpdate({
      name,
    }, {
      $inc: {
        last_processed: incrementBy,
      },
    });
};

module.exports = {
  getCounter,
  incrementMaxValue,
  incrementLastProcessed,
  setDaoServerNonce,
  getDaoServerNonce,
  incrementAndGetSelfNonce,
};
