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

const updateSpecialProposal = async () => {
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  const provider = process.env.WEB3_HTTP_PROVIDER;
  const web3 = new Web3(new Web3.providers.HttpProvider(provider));
  const networkId = await web3.version.network;
  await initContracts(web3, networkId);

  const proposalId = process.env.PROPOSAL_ID;

  console.log('proposal ID = ', proposalId);

  const proposal = await mongoClient
    .collection(collections.SPECIAL_PROPOSALS)
    .findOne({ proposalId });

  console.log('[old] proposal = ', proposal);

  const quorum = (await getContracts().daoCalculatorService.minimumVotingQuorumForSpecial.call()).toString();

  console.log('[updated] quorum = ', quorum);

  proposal.votingRounds[0].quorum = quorum;

  await mongoClient
    .collection(collections.SPECIAL_PROPOSALS)
    .updateOne({ proposalId }, { $set: proposal });

  console.log('done');
};

updateSpecialProposal();
