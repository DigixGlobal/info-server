const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const getCounter = async (name) => {
  const counter = await mongoUtil.getDB()
    .collection(collections.COUNTERS)
    .findOne({ name });
  return counter;
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
};
