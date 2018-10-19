const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const updateDao = async (update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.DAO)
    .updateOne({ index: 'index' }, update, moreOptions);
};

module.exports = {
  updateDao,
};
