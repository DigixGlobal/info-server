const EthereumTx = require('ethereumjs-tx');

const {
  encodeHash,
} = require('@digix/helpers/lib/helpers');

const {
  getPendingKycApprovals,
  setKycProcessed,
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
  signTxn,
  getWeb3,
} = require('../web3Wrapper/web3Util');

const {
  notifyDaoServer,
} = require('./notifier');

const _getCallData = (entry) => {
  return getContracts()
    .daoIdentity
    .updateKyc
    .request(
      entry.address,
      encodeHash(entry.doc_hash),
      entry.id_expiration,
    )
    .params[0]
    .data;
};

const _txnObject = (entry, kycAdmin, nonce) => {
  return {
    from: kycAdmin,
    to: getContracts().daoIdentity.address,
    gas: 300000,
    gasPrice: 40 * (10 ** 9),
    data: _getCallData(entry),
    nonce,
  };
};

const _rawTxn = (signedTxn) => {
  return '0x'.concat(signedTxn.serialize().toString('hex'));
};

const approveKyc = async (entry) => {
  const kycAdmin = '0x'.concat(JSON.parse(process.env.KYC_ADMIN_KEYSTORE).address);
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
  for (const entry of pendingKycApprovals) {
    try {
      const txnId = await approveKyc(entry);
      await setKycProcessed(entry._id, txnId);
      await insertPendingTransactions([{ txhash: txnId }]);
    } catch (e) {
      console.log('[ERROR] ', e);
    }
  }
};

const updateKycApprovals = async (txhash) => {
  const approvedKycs = await setKycSuccess(txhash);
  await removePendingTransactions([txhash]);
  if (approvedKycs.length > 0) {
    notifyDaoServer({
      method: 'POST',
      path: '/admin/kyc_approval_update',
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
