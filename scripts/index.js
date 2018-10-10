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
  refreshDao,
};
