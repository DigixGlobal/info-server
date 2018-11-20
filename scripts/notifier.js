const crypto = require('crypto');
const request = require('request');

const {
  incrementAndGetSelfNonce,
} = require('../dbWrapper/counters');

const {
  removePendingTransactions,
} = require('../dbWrapper/transactions');

const notifyDaoServer = async (notification) => {
  const nonce = await incrementAndGetSelfNonce();

  const message = notification.method
    + notification.path
    + JSON.stringify(notification.body.payload)
    + nonce;
  const signature = crypto
    .createHmac('sha256', process.env.SERVER_SECRET)
    .update(message)
    .digest('hex');

  const options = {
    baseUrl: process.env.DAO_SERVER_URL,
    url: notification.path,
    method: notification.method,
    body: JSON.stringify(notification.body),
    headers: {
      'ACCESS-SIGN': signature,
      'ACCESS-NONCE': nonce,
    },
  };

  request(options, async function (err) {
    if (err) console.log(err);
    if (notification.path === '/transactions/confirmed') {
      // TODO: check if status is 200
      // only then remove those pending txns
      const txhashes = notification.body.payload.map(txn => txn.txhash);
      await removePendingTransactions(txhashes);
    }
  });
};

module.exports = {
  notifyDaoServer,
};
