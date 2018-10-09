const refreshProposal = require('./refreshProposal');
const refreshDao = require('./refreshDao');
const setDummyData = require('./setDummyData');

// TODO
const watchProposalEvent = (event, callback) => {
  // watch the event that changes a proposal, and call callback(proposalId);
}

const watchProposalEvents = async (db, contracts) => {
  // watch any event that would change a proposal's details
  // when it happens:
  //    - update MongoDB database
  //    - notify the Dao Server if need to

  watchProposalEvent(contracts.dao.ModifyProposal, (proposalId) => {
    refreshProposal(db, contracts, proposalId);
    // TODO: and maybe notify Dao server
  });

  watchProposalEvent(contracts.dao.FinalizeProposal, (proposalId) => {
    refreshProposal(db, contracts, proposalId);
    // TODO: and maybe notify Dao server
  });

  // ......
};

module.exports = {
  setDummyData,
  watchProposalEvents,
  refreshProposal,
  refreshDao,
};
