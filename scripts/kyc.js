const EthereumTx = require('ethereumjs-tx');

const {
  getPendingKycApprovals,
  setManyKycProcessed,
  setKycSuccess,
} = require('../dbWrapper/kyc');

const {
  insertPendingTransactions,
  removePendingTransactions,
} = require('../dbWrapper/transactions');

const {
  getContracts,
} = require('../helpers/contracts');

const {
  daoServerEndpoints,
} = require('../helpers/constants');

const {
  signTxn,
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  notifyDaoServer,
} = require('./notifier');

const keystore = require('../keystore/kyc-admin.json');

const _getField = (entries, fieldName) => {
  const fields = [];
  entries.forEach((entry) => {
    fields.push(entry[fieldName]);
  });
  return fields;
};

const _getCallData = (entries) => {
  return getContracts()
    .daoIdentity
    .bulkUpdateKyc
    .request(
      _getField(entries, 'address'), '',
      _getField(entries, 'id_expiration'),
    )
    .params[0]
    .data;
};

const _txnObject = (entries, kycAdmin, nonce) => {
  return {
    from: kycAdmin,
    to: getContracts().daoIdentity.address,
    gas: 300000,
    gasPrice: 40 * (10 ** 9),
    data: _getCallData(entries),
    nonce,
  };
};

const _rawTxn = (signedTxn) => {
  return '0x'.concat(signedTxn.serialize().toString('hex'));
};

const approveKyc = async (entry) => {
  const kycAdmin = '0x'.concat(keystore.address);
  const nonce = await getWeb3().eth.getTransactionCount(kycAdmin);
  const txnObj = _txnObject(entry, kycAdmin, nonce);
  const txn = new EthereumTx(txnObj);
  const signedTxn = signTxn(txn);
  const txnId = await getWeb3().eth.sendRawTransaction(_rawTxn(signedTxn));
  return txnId;
};

const processPendingKycs = async () => {
  const pendingKycApprovals = await getPendingKycApprovals({ status: 'pending' }, 10);
  if (pendingKycApprovals.length <= 0) return;
  try {
    const txnId = await approveKyc(pendingKycApprovals);
    await setManyKycProcessed(_getField(pendingKycApprovals, '_id'), txnId);
    await insertPendingTransactions([{ txhash: txnId }]);
  } catch (e) {
    console.log('[ERROR] ', e);
  }
};

const updateKycApprovals = async (txhash) => {
  const approvedKycs = await setKycSuccess(txhash);
  await removePendingTransactions([txhash]);
  if (approvedKycs.length > 0) {
    notifyDaoServer({
      method: 'POST',
      path: daoServerEndpoints.KYC_UPDATE,
      body: {
        payload: {
          approved: approvedKycs,
        },
      },
    });
  }
};

module.exports = {
  processPendingKycs,
  updateKycApprovals,
};
