const {
  updateDao,
  updateDaoConfigs,
} = require('../dbWrapper/dao');

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

  const dgxDistributionDay = (await getContracts().daoRewardsStorage.readDgxDistributionDay.call(daoInfo[0])).toNumber();
  const currentQuarter = daoInfo[0].toNumber();

  console.log('dgxDistributionDay = ', dgxDistributionDay);

  await updateDao({
    $set: {
      currentQuarter,
      startOfQuarter: daoInfo[1].toNumber(),
      startOfMainphase: daoInfo[2].toNumber(),
      startOfNextQuarter: daoInfo[3].toNumber(),
      totalLockedDgds: totalLockedDgds.toNumber(),
      totalModeratorLockedDgds: totalModeratorLockedDgds.toNumber(),
      isGlobalRewardsSet: currentQuarter > 1 ? dgxDistributionDay > 0 : true,
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
    },
  });
};

module.exports = {
  initDao,
  refreshDao,
  refreshDaoConfigs,
};
