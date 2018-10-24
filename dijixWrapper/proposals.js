const dijixUtil = require('./dijixUtil');

const fetchProposalVersion = async (ipfsHash) => {
  const dijixObject = await dijixUtil.getDijix().fetch(ipfsHash);
  return dijixObject;
};

module.exports = {
  fetchProposalVersion,
};
