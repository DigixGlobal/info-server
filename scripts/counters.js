const assert = require('assert');

const {
  collections,
} = require('../helpers/constants');

const getCurrentIndex = (db, name, callback) => {
  db.get(collections.COUNTERS).findOne({
    name,
  }, function (err, r) {
    assert.equal(null, err);
    callback(r);
  });
};

const incrementAndGetNextIndex = (db, name, callback) => {
  db.get(collections.COUNTERS).findOneAndUpdate({
    name,
  }, {
    $inc: {
      max_value: 1,
    },
  }, {
    returnOriginal: false,
  }, function (err, r) {
    assert.equal(null, err);
    callback(r);
  });
};

module.exports = {
  getCurrentIndex,
  incrementAndGetNextIndex,
};
