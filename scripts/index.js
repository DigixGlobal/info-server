const a = require('awaiting');

const {
  refreshProposalDetails,
  refreshProposalFinalizeProposal,
  refreshProposalFinishMilestone,
  refreshProposalDraftVotingClaim,
  refreshProposalVotingClaim,
  refreshProposalCloseProposal,
  refreshProposalPRLAction,
} = require('./refreshProposal');

const refreshDao = require('./refreshDao');
const setDummyData = require('./setDummyData');

/**
 * Callback for handling response from the watched event
 *
 * @callback refreshDB
 * @param {Object} [res] result object
 */

/**
 * @param {Object} [event] object
 * @param {refreshDB} [callback] A callback to handle the event
 */
const watchProposalEvent = (event, callback) => {
  // watch the event that changes a proposal, and call callback(proposalId);
  // TODO
  event().watch(function (err, result) {
    const { args } = result;
    callback(args);
  });
};

const watchAndProcessNewBlocks = (w3, db, contracts) => {
  const filter = w3.eth.filter('latest');
  filter.watch(async () => {
    const currentBlockNumber = w3.eth.blockNumber;
    const blockNumberToProcess = currentBlockNumber - parseInt(process.env.BLOCK_CONFIRMATIONS, 10);
    console.log('currentBlockNumber = ', currentBlockNumber);
    console.log('blockNumberToProcess = ', blockNumberToProcess);
    const block = w3.eth.getBlock(blockNumberToProcess);
    await a.map(block.transactions, 20, async (tnxId) => {
      const tx = await w3.eth.getTransaction(tnxId);
      const txReceipt = await w3.eth.getTransactionReceipt(tnxId);
      if (!contracts.fromAddress[tx.to] || txReceipt.status !== '0x01') return; // if not sending to our contracts, or reverted: no need to process
      console.log('decoded = ', contracts.decoder.decodeMethod(tx.input));
    });
  });
};

const watchProposalEvents = async (db, contracts) => {
  console.log('entered here');
  // watch any event that would change a proposal's details
  // when it happens:
  //    - update MongoDB database
  //    - notify the Dao Server if need to
  watchProposalEvent(contracts.dao.NewProposal, (res) => {
    refreshProposalDetails(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.ModifyProposal, (res) => {
    refreshProposalDetails(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.ChangeProposalFunding, (res) => {
    refreshProposalDetails(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.AddProposalDoc, (res) => {
    refreshProposalDetails(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.FinalizeProposal, (res) => {
    refreshProposalFinalizeProposal(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.FinishMilestone, (res) => {
    refreshProposalFinishMilestone(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.CloseProposal, (res) => {
    refreshProposalCloseProposal(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.PRLAction, (res) => {
    refreshProposalPRLAction(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.daoVotingClaims.DraftVotingClaim, (res) => {
    refreshProposalDraftVotingClaim(db, contracts, res);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.daoVotingClaims.VotingClaim, (res) => {
    refreshProposalVotingClaim(db, contracts, res);
    // TODO: and maybe notify Dao server
  });
};

module.exports = {
  setDummyData,
  watchProposalEvents,
  watchAndProcessNewBlocks,
  refreshDao,
};
