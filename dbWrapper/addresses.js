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

const getAllAddresses = async (filter) => {
  const addresses = await mongoUtil.getDB()
    .collection(collections.ADDRESSES)
    .find(filter)
    .toArray()
    .map(doc => doc.address);
  return addresses;
};

module.exports = {
  updateAddress,
  insertAddress,
  getAddressDetails,
  getAllAddresses,
};
