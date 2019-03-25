const assert = require('assert');

const {
  initMongoClient,
  isInvalid,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const addForumAdmin = async () => {
  // connect to and get mongo db
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  assert.ok(!isInvalid(process.env.FORUM_ADMIN_ADDRESS), 'Please provide the FORUM_ADMIN_ADDRESS');

  // add kyc admin
  await mongoClient.collection(collections.ADDRESSES).insertOne({
    address: process.env.FORUM_ADMIN_ADDRESS.toLowerCase(),
    isForumAdmin: true,
  });

  console.log('inserted new forum admin = ', process.env.FORUM_ADMIN_ADDRESS);
};

addForumAdmin();
