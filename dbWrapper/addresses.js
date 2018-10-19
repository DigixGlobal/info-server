const mongoUtil = require('./mongoUtil');

const {
  collections,
} = require('../helpers/constants');

const insertAddress = async (address) => {
  await mongoUtil.getDB()
    .collection(collections.ADDRESSES)
    .insertOne(address);
};

const updateAddress = async (address, update, moreOptions = {}) => {
  await mongoUtil.getDB()
    .collection(collections.ADDRESSES)
    .updateOne({ address }, update, moreOptions);
};

const getAddressDetails = async (address) => {
  const addressDetails = await mongoUtil.getDB()
    .collection(collections.ADDRESSES)
    .findOne({ address });
  return addressDetails;
};

module.exports = {
  updateAddress,
  insertAddress,
  getAddressDetails,
};
