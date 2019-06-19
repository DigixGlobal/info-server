const request = require('request');

const {
  store,
} = require('../cacheWrapper/cacheUtil');

const updatePrices = async () => {
  const options = {
    baseUrl: process.env.PRICEFEED_SERVER,
    url: '/tick/ethusd',
    method: 'GET',
    strictSSL: true,
    headers: {
      'content-type': 'application/json',
    },
  };

  request(options, async function (err, response, body) {
    if (err) {
      console.log(err);
    }
    body = JSON.parse(body);
    if (body && body.data && body.data.price) store('ethusd', body.data.price);
  });
};

module.exports = {
  updatePrices,
};
