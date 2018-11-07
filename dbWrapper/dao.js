const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const updateDao = async (update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.DAO)
    .updateOne({ index: 'index' }, update, moreOptions);
};

const getDaoInfo = async () => {
  const info = await mongoUtil.getDB()
    .collection(collections.DAO)
    .findOne({});
  if (info && info._id) delete info._id;
  return info;
};

module.exports = {
  updateDao,
  getDaoInfo,
};
