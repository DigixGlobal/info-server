const Web3 = require('web3');

const {
  initMongoClient,
} = require('../helpers');

const {
  collections,
} = require('../../../helpers/constants');

const {
  initContracts,
  getContracts,
} = require('../../../helpers/contracts');

const getAddressObject = (userInfo) => {
  return {
    isParticipant: userInfo[0],
    isModerator: userInfo[1],
    isDigix: userInfo[2],
    redeemedBadge: userInfo[3],
    lastParticipatedQuarter: userInfo[4].toNumber(),
    lastQuarterThatReputationWasUpdated: userInfo[5].toNumber(),
    lockedDgdStake: userInfo[6].toString(),
    lockedDgd: userInfo[7].toString(),
    reputationPoint: userInfo[8].toString(),
    quarterPoint: userInfo[9].toString(),
    claimableDgx: userInfo[10].toString(),
    moderatorQuarterPoint: userInfo[11].toString(),
  };
};

const updateAddress = async () => {
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  const provider = process.env.WEB3_HTTP_PROVIDER;
  const web3 = new Web3(new Web3.providers.HttpProvider(provider));
  const networkId = await web3.version.network;
  await initContracts(web3, networkId);

  const address = process.env.USER_ADDRESS;

  const addressDetails = await mongoClient
    .collection(collections.ADDRESSES)
    .findOne({ address });

  if (addressDetails) {
    const userInfo = await getContracts().daoInformation.readUserInfo.call(address);

    await mongoClient.collection(collections.ADDRESSES)
      .updateOne({ address }, {
        $set: {
          ...getAddressObject(userInfo),
        },
      }, { upsert: true });
  }

  console.log('done');
};

updateAddress();
