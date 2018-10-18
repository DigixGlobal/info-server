const {
  collections,
} = require('../helpers/constants');

const getCounter = async (db, name) => {
  const counter = await db.collection(collections.COUNTERS).findOne({ name });
  return counter;
};

const incrementMaxValue = async (db, name, incrementBy) => {
  await db.collection(collections.COUNTERS).findOneAndUpdate({
    name,
  }, {
    $inc: {
      max_value: incrementBy,
    },
  });
};

const incrementLastProcessed = async (db, name, incrementBy) => {
  await db.collection(collections.COUNTERS).findOneAndUpdate({
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
