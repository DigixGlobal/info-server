const {
  initMongoClient,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const removePRL = async () => {
  // connect to and get mongo db
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  // remove prl
  await mongoClient.collection(collections.ADDRESSES).deleteOne({
    address: process.env.PRL_ADDRESS,
  });

  console.log('removed prl = ', process.env.PRL_ADDRESS);
};

removePRL();
