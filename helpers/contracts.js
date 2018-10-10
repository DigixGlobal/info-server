const ContractResolver = require('@digix/dao-contracts/build/contracts/ContractResolver.json');
const Dao = require('@digix/dao-contracts/build/contracts/Dao.json');
const MockDaoConfigsStorage = require('@digix/dao-contracts/build/contracts/MockDaoConfigsStorage.json');
const DaoFundingManager = require('@digix/dao-contracts/build/contracts/DaoFundingManager.json');
const DaoFundingStorage = require('@digix/dao-contracts/build/contracts/DaoFundingStorage.json');
const DaoIdentity = require('@digix/dao-contracts/build/contracts/DaoIdentity.json');
const DaoIdentityStorage = require('@digix/dao-contracts/build/contracts/DaoIdentityStorage.json');
const DaoListingService = require('@digix/dao-contracts/build/contracts/DaoListingService.json');
const DaoPointsStorage = require('@digix/dao-contracts/build/contracts/DaoPointsStorage.json');
const DaoRewardsManager = require('@digix/dao-contracts/build/contracts/DaoRewardsManager.json');
const DaoRewardsManagerExtras = require('@digix/dao-contracts/build/contracts/DaoRewardsManagerExtras.json');
const DaoRewardsStorage = require('@digix/dao-contracts/build/contracts/DaoRewardsStorage.json');
const DaoSpecialProposal = require('@digix/dao-contracts/build/contracts/DaoSpecialProposal.json');
const DaoSpecialStorage = require('@digix/dao-contracts/build/contracts/DaoSpecialStorage.json');
const DaoSpecialVotingClaims = require('@digix/dao-contracts/build/contracts/DaoSpecialVotingClaims.json');
const DaoStakeLocking = require('@digix/dao-contracts/build/contracts/DaoStakeLocking.json');
const DaoStakeStorage = require('@digix/dao-contracts/build/contracts/DaoStakeStorage.json');
const DaoStorage = require('@digix/dao-contracts/build/contracts/DaoStorage.json');
const DaoUpgradeStorage = require('@digix/dao-contracts/build/contracts/DaoUpgradeStorage.json');
const DaoVoting = require('@digix/dao-contracts/build/contracts/DaoVoting.json');
const DaoVotingClaims = require('@digix/dao-contracts/build/contracts/DaoVotingClaims.json');
const DaoWhitelisting = require('@digix/dao-contracts/build/contracts/DaoWhitelisting.json');
const DaoWhitelistingStorage = require('@digix/dao-contracts/build/contracts/DaoWhitelistingStorage.json');

const contracts = {
  contractResolver: ContractResolver,
  dao: Dao,
  daoConfigsStorage: MockDaoConfigsStorage,
  daoFundingManager: DaoFundingManager,
  daoFundingStorage: DaoFundingStorage,
  daoIdentity: DaoIdentity,
  daoIdentityStorage: DaoIdentityStorage,
  daoListingService: DaoListingService,
  daoPointsStorage: DaoPointsStorage,
  daoRewardsManager: DaoRewardsManager,
  daoRewardsManagerExtras: DaoRewardsManagerExtras,
  daoRewardsStorage: DaoRewardsStorage,
  daoSpecialProposal: DaoSpecialProposal,
  daoSpecialStorage: DaoSpecialStorage,
  daoSpecialVotingClaims: DaoSpecialVotingClaims,
  daoStakeLocking: DaoStakeLocking,
  daoStakeStorage: DaoStakeStorage,
  daoStorage: DaoStorage,
  daoUpgradeStorage: DaoUpgradeStorage,
  daoVoting: DaoVoting,
  daoVotingClaims: DaoVotingClaims,
  daoWhitelisting: DaoWhitelisting,
  daoWhitelistingStorage: DaoWhitelistingStorage,
};

const getContracts = async (contractObjs, w3, networkId) => {
  for (const k in contracts) {
    const contract = contracts[k];
    contractObjs[k] = w3.eth.contract(contract.abi).at(contract.networks[networkId].address);
  }

  return contractObjs;
};

module.exports = {
  getContracts,
};
