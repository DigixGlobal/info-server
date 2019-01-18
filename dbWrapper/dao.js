const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const updateDao = async (update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.DAO)
    .updateOne({ index: 'index' }, update, moreOptions);
};

const updateDaoConfigs = async (configs, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.DAO_CONFIGS)
    .updateOne({ index: 'index' }, configs, moreOptions);
};

const getDaoConfigs = async () => {
  const daoConfigs = await mongoUtil.getDB()
    .collection(collections.DAO_CONFIGS)
    .findOne({}, { _id: 0 });
  if (daoConfigs && daoConfigs._id) delete daoConfigs._id;
  return daoConfigs;
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
  getDaoConfigs,
  updateDaoConfigs,
};
