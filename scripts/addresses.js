const {
  getAddressDetails,
  updateAddress,
  insertAddress,
} = require('../dbWrapper/addresses');

const {
  updateDao,
} = require('../dbWrapper/dao');

const {
  getContracts,
} = require('../helpers/contracts');

const _getAddressObject = (userInfo) => {
  return {
    isParticipant: userInfo[0],
    isModerator: userInfo[1],
    lastParticipatedQuarter: userInfo[2],
    lockedDgdStake: userInfo[3],
    lockedDgd: userInfo[4],
    reputationPoint: userInfo[5],
    quarterPoint: userInfo[6],
  };
};

const _getInsertAddressObj = (user) => {
  return {
    address: user,
    votes: {},
  };
};

const _getUser = (res) => {
  let user;
  for (const event of res._events) {
    for (const argName in event) {
      if (argName === '_user') {
        user = event[argName];
      }
    }
  }
  return user;
};

const refreshAddress = async (res) => {
  const user = _getUser(res);

  // update address table
  const userInfo = await getContracts().daoInformation.readUserInfo.call(user);
  if (await getAddressDetails(user)) {
    await updateAddress(user, {
      $set: _getAddressObject(userInfo),
    }, { upsert: true });
  } else {
    await insertAddress({
      ..._getAddressObject(userInfo),
      ..._getInsertAddressObj(user),
    });
  }

  // update lockedDGDs in daoInfo
  const totalLockedDgds = await getContracts()
    .daoStakeStorage
    .totalLockedDGDStake
    .call();
  const totalModeratorLockedDgds = await getContracts()
    .daoStakeStorage
    .totalModeratorLockedDGDStake
    .call();
  await updateDao({
    $set: {
      totalLockedDgds,
      totalModeratorLockedDgds,
    },
  });
};

module.exports = {
  refreshAddress,
};
