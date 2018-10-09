const ContractResolver = require('@digix/dao-contracts-kovan/build/contracts/ContractResolver.json');
const Dao = require('@digix/dao-contracts-kovan/build/contracts/Dao.json');
const DaoFundingManager = require('@digix/dao-contracts-kovan/build/contracts/DaoFundingManager.json');
const DaoFundingStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoFundingStorage.json');
const DaoIdentity = require('@digix/dao-contracts-kovan/build/contracts/DaoIdentity.json');
const DaoIdentityStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoIdentityStorage.json');
const DaoListingService = require('@digix/dao-contracts-kovan/build/contracts/DaoListingService.json');
const DaoPointsStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoPointsStorage.json');
const DaoRewardsManager = require('@digix/dao-contracts-kovan/build/contracts/DaoRewardsManager.json');
const DaoRewardsManagerExtras = require('@digix/dao-contracts-kovan/build/contracts/DaoRewardsManagerExtras.json');
const DaoRewardsStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoRewardsStorage.json');
const DaoSpecialProposal = require('@digix/dao-contracts-kovan/build/contracts/DaoSpecialProposal.json');
const DaoSpecialStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoSpecialStorage.json');
const DaoSpecialVotingClaims = require('@digix/dao-contracts-kovan/build/contracts/DaoSpecialVotingClaims.json');
const DaoStakeLocking = require('@digix/dao-contracts-kovan/build/contracts/DaoStakeLocking.json');
const DaoStakeStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoStakeStorage.json');
const DaoStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoStorage.json');
const DaoUpgradeStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoUpgradeStorage.json');
const DaoVoting = require('@digix/dao-contracts-kovan/build/contracts/DaoVoting.json');
const DaoVotingClaims = require('@digix/dao-contracts-kovan/build/contracts/DaoVotingClaims.json');
const DaoWhitelisting = require('@digix/dao-contracts-kovan/build/contracts/DaoWhitelisting.json');
const DaoWhitelistingStorage = require('@digix/dao-contracts-kovan/build/contracts/DaoWhitelistingStorage.json');

const contracts = {
  ContractResolver,
  Dao,
  DaoFundingManager,
  DaoFundingStorage,
  DaoIdentity,
  DaoIdentityStorage,
  DaoListingService,
  DaoPointsStorage,
  DaoRewardsManager,
  DaoRewardsManagerExtras,
  DaoRewardsStorage,
  DaoSpecialProposal,
  DaoSpecialStorage,
  DaoSpecialVotingClaims,
  DaoStakeLocking,
  DaoStakeStorage,
  DaoStorage,
  DaoUpgradeStorage,
  DaoVoting,
  DaoVotingClaims,
  DaoWhitelisting,
  DaoWhitelistingStorage,
};

const getContract = function (name, networkId) {
  const contract = contracts[name];
  // let latestNetwork = Math.max(...Object.keys(contract.networks));
  // const selectedNetwork = DEFAULT_NETWORKS.find(n => n.id === network);
  // if (selectedNetwork.id.toLowerCase() !== 'testrpc') {
  //   latestNetwork = selectedNetwork.chainId;
  // }

  return {
    abi: contract.abi,
    address: contract.networks[networkId].address,
  };
};

module.exports = {
  getContract,
};
