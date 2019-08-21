const assert = require('assert');

const {
  initMongoClient,
  isInvalid,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const addPRL = async () => {
  // connect to and get mongo db
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  assert.ok(!isInvalid(process.env.PRL_ADDRESS), 'Please provide the PRL_ADDRESS');

  // add prl
  await mongoClient.collection(collections.ADDRESSES).insertOne({
    address: process.env.PRL_ADDRESS.toLowerCase(),
    isPrl: true,
  });

  console.log('inserted new prl = ', process.env.PRL_ADDRESS);
};

addPRL();
