const Web3 = require('web3');
const Wallet = require('ethereumjs-wallet');

let _web3;
let _bufferPK;

const signTxn = (txn) => {
  txn.sign(_bufferPK);
  return txn;
};

const decryptKycAdminKey = (keystore, password) => {
  const decryptedKey = Wallet.fromV3(keystore, password);
  _bufferPK = decryptedKey.getPrivateKey();
};

const initWeb3 = (provider) => {
  _web3 = new Web3(new Web3.providers.HttpProvider(provider));
  decryptKycAdminKey(process.env.KYC_ADMIN_KEYSTORE, process.env.KYC_ADMIN_PASSWORD);
};

const getWeb3 = () => {
  return _web3;
};

module.exports = {
  initWeb3,
  getWeb3,
  signTxn,
};
