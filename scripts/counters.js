const {
  collections,
} = require('../helpers/constants');

const getCounter = async (db, name) => {
  const counter = await db.collection(collections.COUNTERS).findOne({ name });
  return counter;
};

const incrementCounter = async (db, name, incrementBy) => {
  await db.collection(collections.COUNTERS).findOneAndUpdate({
    name,
  }, {
    $inc: {
      max_value: incrementBy,
    },
  });
};

module.exports = {
  getCounter,
  incrementCounter,
};
