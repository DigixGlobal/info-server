const Web3 = require('web3');
const Wallet = require('ethereumjs-wallet');
const keystore = require('../keystore/kyc-admin.json');

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
  console.log('INFOLOG: initWeb3');
  _web3 = new Web3(new Web3.providers.HttpProvider(provider));
  decryptKycAdminKey(keystore, process.env.KYC_ADMIN_PASSWORD);
};

const getWeb3 = () => {
  return _web3;
};

module.exports = {
  initWeb3,
  getWeb3,
  signTxn,
};
