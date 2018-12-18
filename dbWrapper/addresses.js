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
  if (addressDetails && addressDetails._id) delete addressDetails._id;
  return addressDetails;
};

const getAddressesDetails = async (filter) => {
  const addressesDetails = [];
  const cursor = mongoUtil.getDB()
    .collection(collections.ADDRESSES)
    .find(filter, { _id: 0 });
  for (let address = await cursor.next(); address != null; address = await cursor.next()) {
    addressesDetails.push(address);
  }
  return addressesDetails;
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
  getAddressesDetails,
};
