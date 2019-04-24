const dijixUtil = require('./dijixUtil');

const fetchProposalVersion = async (ipfsHash) => {
  const dijixObject = await dijixUtil.getDijix().failSafeFetch(ipfsHash);
  return dijixObject;
};

const fetchMultiple = async (hashes) => {
  const docs = [];
  for (const hash of hashes) {
    const doc = await dijixUtil.getDijix().failSafeFetch(hash);
    docs.push(doc);
  }
  return docs;
};

module.exports = {
  fetchProposalVersion,
  fetchMultiple,
};
