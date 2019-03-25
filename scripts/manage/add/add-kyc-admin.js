const assert = require('assert');

const {
  initMongoClient,
  isInvalid,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const addKycAdmin = async () => {
  // connect to and get mongo db
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  assert.ok(!isInvalid(process.env.KYC_ADMIN_ADDRESS), 'Please provide the KYC_ADMIN_ADDRESS');

  // add kyc admin
  await mongoClient.collection(collections.ADDRESSES).insertOne({
    address: process.env.KYC_ADMIN_ADDRESS.toLowerCase(),
    isKycOfficer: true,
  });

  console.log('inserted new kyc admin = ', process.env.KYC_ADMIN_ADDRESS);
};

addKycAdmin();
