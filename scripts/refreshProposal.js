module.exports = async (db, contracts, proposalId) => {
  // this proposal has been changed in one way or another
  // we need to update its details in the database

  // might as well assume that we know nothing about the proposal
  // and get all the details for it

  const proposalDetails = { proposalId };

  // first, determine which phase it is,
  proposalDetails.stage = 'blahblah';

  // slowly get all the details ......

  // update the database
};
