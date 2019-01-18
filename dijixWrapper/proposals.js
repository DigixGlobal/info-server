const dijixUtil = require('./dijixUtil');

const fetchProposalVersion = async (ipfsHash) => {
  const dijixObject = await dijixUtil.getDijix().failSafeFetch(ipfsHash);
  return dijixObject;
};

module.exports = {
  fetchProposalVersion,
};
