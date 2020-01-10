// will only update the voting times and deadlines
// and quorum of current voting round
const Web3 = require('web3');

const BigNumber = require('bignumber.js');

const {
  initMongoClient,
} = require('../helpers');

const {
  collections,
  daoConfigsKeys,
} = require('../../../helpers/constants');

const {
  initContracts,
  getContracts,
} = require('../../../helpers/contracts');

const updateProposal = async () => {
  const mongoClient = await initMongoClient('mongodb://localhost:27017/digixdao', 'digixdao');

  const provider = process.env.WEB3_HTTP_PROVIDER;
  const web3 = new Web3(new Web3.providers.HttpProvider(provider));
  const networkId = await web3.version.network;
  await initContracts(web3, networkId);

  const proposalId = process.env.PROPOSAL_ID;

  const proposal = await mongoClient
    .collection(collections.PROPOSALS)
    .findOne({ proposalId });

  console.log('[old] voting start = ', proposal.votingRounds[0].startTime);
  console.log('[old] commit deadline = ', proposal.votingRounds[0].commitDeadline);
  console.log('[old] reveal deadline = ', proposal.votingRounds[0].revealDeadline);

  console.log('proposal current voting round = ', proposal.currentVotingRound);
  console.log('[old] quorum = ', proposal.votingRounds[proposal.currentVotingRound].quorum);

  const votingStartTime = (await getContracts().daoStorage.readProposalVotingTime.call(proposalId, new BigNumber(0))).toNumber();
  const commitPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_COMMIT_PHASE)).toNumber();
  const votingPhaseDuration = (await getContracts().daoConfigsStorage.uintConfigs.call(daoConfigsKeys.CONFIG_VOTING_PHASE_TOTAL)).toNumber();
  const quorum = (await getContracts().daoCalculatorService.minimumVotingQuorum.call(proposalId, new BigNumber(proposal.currentVotingRound))).toString();

  proposal.votingRounds[0].startTime = votingStartTime;
  proposal.votingRounds[0].commitDeadline = votingStartTime + commitPhaseDuration;
  proposal.votingRounds[0].revealDeadline = votingStartTime + votingPhaseDuration;
  proposal.votingRounds[proposal.currentVotingRound].quorum = quorum;

  console.log('[new] voting start = ', proposal.votingRounds[0].startTime);
  console.log('[new] commit deadline = ', proposal.votingRounds[0].commitDeadline);
  console.log('[new] reveal deadline = ', proposal.votingRounds[0].revealDeadline);
  console.log('[new] quorum = ', proposal.votingRounds[proposal.currentVotingRound].quorum);

  await mongoClient
    .collection(collections.PROPOSALS)
    .updateOne({ proposalId }, { $set: proposal });

  console.log('done');
};

updateProposal();
