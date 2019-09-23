const {
  getCurrentTimestamp,
} = require('@digix/helpers/lib/helpers');

const {
  updateDao,
  updateDaoConfigs,
  getDaoInfo,
} = require('../dbWrapper/dao');

const {
  updateAddresses,
} = require('../dbWrapper/addresses');

const {
  getContracts,
} = require('../helpers/contracts');

const {
  daoConfigsIndices,
} = require('../helpers/constants');

const initDao = async () => {
  const daoInfo = await getContracts().daoInformation.readDaoInfo.call();
  const totalLockedDgds = await getContracts()
    .daoStakeStorage
    .totalLockedDGDStake
    .call();
  const totalModeratorLockedDgds = await getContracts()
    .daoStakeStorage
    .totalModeratorLockedDGDStake
    .call();
  // don't need to wait for this to be completed

  await updateDao({
    $set: {
      currentQuarter: daoInfo[0].toNumber(),
      startOfQuarter: daoInfo[1].toNumber(),
      startOfMainphase: daoInfo[2].toNumber(),
      startOfNextQuarter: daoInfo[3].toNumber(),
      totalLockedDgds: totalLockedDgds.toNumber(),
      totalModeratorLockedDgds: totalModeratorLockedDgds.toNumber(),
      isGlobalRewardsSet: daoInfo[5],
      nModerators: daoInfo[6].toNumber(),
      nParticipants: daoInfo[7].toNumber(),
    },
  }, { upsert: true });
};

const initDaoAtNewQuarter = async () => {
  const daoInfo = await getContracts().daoInformation.readDaoInfo.call();
  const totalLockedDgds = await getContracts()
    .daoStakeStorage
    .totalLockedDGDStake
    .call();
  const totalModeratorLockedDgds = await getContracts()
    .daoStakeStorage
    .totalModeratorLockedDGDStake
    .call();
  const fundsInDao = await getWeb3().eth.getBalance(getContracts().daoFundingManager.address);
  // don't need to wait for this to be completed

  // set everybody to be not participants and not moderators
  await updateAddresses({ isParticipant: true }, {
    $set: {
      isParticipant: false,
      isModerator: false,
    },
  });

  await updateDao({
    $set: {
      currentQuarter: daoInfo[0].toNumber(),
      startOfQuarter: daoInfo[1].toNumber(),
      startOfMainphase: daoInfo[2].toNumber(),
      startOfNextQuarter: daoInfo[3].toNumber(),
      totalLockedDgds: totalLockedDgds.toNumber(),
      totalModeratorLockedDgds: totalModeratorLockedDgds.toNumber(),
      isGlobalRewardsSet: daoInfo[5],
      nModerators: daoInfo[6].toNumber(),
      nParticipants: daoInfo[7].toNumber(),
      remainingFunds: fundsInDao.toNumber(),
    },
  }, { upsert: true });
};

const refreshDaoConfigs = async () => {
  const readDaoConfigs = await getContracts().daoConfigsStorage.readUintConfigs.call();
  const daoConfigs = {};
  for (const k in daoConfigsIndices) {
    daoConfigs[k] = readDaoConfigs[daoConfigsIndices[k]].toString();
  }
  await updateDaoConfigs({
    $set: daoConfigs,
  }, { upsert: true });
};

// TODO: we don't really need to `refreshDao` after every minute
// since the values `daoInfo` stores are not gonna change
// they change only when someobody locks/withdraws tokens
// which is already handled in the `addresses.js`
const refreshDao = async () => {
  const daoInfo = await getContracts().daoInformation.readDaoInfo.call();
  // don't need to wait for this to be completed
  await updateDao({
    $set: {
      currentQuarter: daoInfo[0].toNumber(),
      startOfQuarter: daoInfo[1].toNumber(),
      startOfMainphase: daoInfo[2].toNumber(),
      startOfNextQuarter: daoInfo[3].toNumber(),
      isGlobalRewardsSet: daoInfo[5],
      nModerators: daoInfo[6].toNumber(),
      nParticipants: daoInfo[7].toNumber(),
    },
  });
};

const refreshDaoTemp = async () => {
  const dao = await getDaoInfo();
  await updateDao({
    $set: {
      currentQuarter: 1,
      startOfQuarter: dao.startOfNextQuarter,
      startOfMainphase: dao.startOfNextQuarter + 864000,
      startOfNextQuarter: dao.startOfNextQuarter + 7776000,
      isGlobalRewardsSet: true,
      nModerators: 0,
      nParticipants: 0,
      totalLockedDgds: 0,
      totalModeratorLockedDgds: 0,
    },
  });
};

const isDaoStarted = async () => {
  const startOfFirstQuarter = await getContracts().daoUpgradeStorage.startOfFirstQuarter.call();
  if (
    startOfFirstQuarter.toNumber() === 0
    || startOfFirstQuarter.toNumber() > getCurrentTimestamp()
  ) {
    return false;
  }
  return true;
};

const getStartOfFirstQuarter = async () => {
  const startOfFirstQuarter = await getContracts().daoUpgradeStorage.startOfFirstQuarter.call();
  return startOfFirstQuarter;
};

const initDaoBeforeStart = async () => {
  const startOfFirstQuarter = await getContracts().daoUpgradeStorage.startOfFirstQuarter.call();
  await updateDao({
    $set: {
      currentQuarter: 0,
      startOfNextQuarter: startOfFirstQuarter.toNumber(),
    },
  }, { upsert: true });
};

module.exports = {
  initDao,
  refreshDao,
  refreshDaoTemp,
  refreshDaoConfigs,
  isDaoStarted,
  initDaoBeforeStart,
  initDaoAtNewQuarter,
  getStartOfFirstQuarter,
};
