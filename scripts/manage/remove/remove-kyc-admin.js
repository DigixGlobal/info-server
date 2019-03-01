const {
  initMongoClient,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const removeKycAdmin = async () => {
  // connect to and get mongo db
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  // add kyc admin
  await mongoClient.collection(collections.ADDRESSES).deleteOne({
    address: process.env.KYC_ADMIN_ADDRESS,
  });

  console.log('removed forum admin = ', process.env.KYC_ADMIN_ADDRESS);
};

removeKycAdmin();
