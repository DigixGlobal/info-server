const Dijix = require('@digix/dijix').default;
const DijixImage = require('dijix-image').default;
const DijixPDF = require('dijix-pdf').default;
const DijixAttestation = require('dijix-attestation').default;

let _dijix;

const init = (ipfsEndpoint, httpEndpoint, timeout) => {
  _dijix = new Dijix({
    ipfsEndpoint,
    httpEndpoint,
    cache: true,
    concurrency: 10,
    requestTimeout: timeout,
    types: [
      new DijixImage(),
      new DijixPDF(),
      new DijixAttestation(),
    ],
  });
};

const getDijix = () => {
  return _dijix;
};

module.exports = {
  init,
  getDijix,
};
