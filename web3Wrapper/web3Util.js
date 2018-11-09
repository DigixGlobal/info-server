const Web3 = require('web3');

let _web3;

const initWeb3 = (provider) => {
  _web3 = new Web3(new Web3.providers.HttpProvider(provider));
};

const getWeb3 = () => {
  return _web3;
};

module.exports = {
  initWeb3,
  getWeb3,
};
