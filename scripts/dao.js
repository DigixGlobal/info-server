const {
  updateDao,
} = require('../dbWrapper/dao');

const {
  getContracts,
} = require('../helpers/contracts');

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
      currentQuarter: daoInfo[0],
      startOfQuarter: daoInfo[1],
      startOfMainphase: daoInfo[2],
      startOfNextQuarter: daoInfo[3],
      totalLockedDgds,
      totalModeratorLockedDgds,
    },
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
      currentQuarter: daoInfo[0],
      startOfQuarter: daoInfo[1],
      startOfMainphase: daoInfo[2],
      startOfNextQuarter: daoInfo[3],
    },
  });
};

module.exports = {
  initDao,
  refreshDao,
};
