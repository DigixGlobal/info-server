module.exports = async (db, contracts, proposalId) => {
  // this proposal has been changed in one way or another
  // we need to update its details in the database

  // might as well assume that we know nothing about the proposal
  // and get all the details for it

  const proposalDetails = { proposalId };

  // first, determine which phase it is,
  proposalDetails.stage = 'blahblah';
  proposalDetails.proposer = await contracts.daoStorage.readProposalProposer.call(proposalId);


  const proposals = db.get('proposals');
  console.log('updating for proposal ', proposalId);
  proposals.update({ proposalId }, proposalDetails, { upsert: true });
  console.log('updated for proposal ', proposalId);

  // slowly get all the details ......

  // update the database
};
