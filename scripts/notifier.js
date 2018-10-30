const crypto = require('crypto');
const request = require('request');

const {
  incrementAndGetSelfNonce,
} = require('../dbWrapper/counters');

const notifyDaoServer = async (txns) => {
  const nonce = await incrementAndGetSelfNonce();

  const req = {
    method: 'POST',
    path: '/transactions/confirmed',
    body: JSON.stringify(txns),
  };
  const message = req.method + req.path + req.body + nonce;
  const signature = crypto
    .createHmac('sha256', process.env.SERVER_SECRET)
    .update(message)
    .digest('hex');

  const options = {
    baseUrl: process.env.DAO_SERVER_URL,
    url: req.path,
    method: req.method,
    body: req.body,
    headers: {
      'ACCESS-SIGN': signature,
      'ACCESS-NONCE': nonce,
    },
  };

  request(options, function (err, response) {
    if (err) console.log(err);
    console.log('response body = ', response.body);
  });
};

module.exports = {
  notifyDaoServer,
};
