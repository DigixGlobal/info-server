const {
  getCounter,
} = require('./counters');

const {
  counters,
} = require('../helpers/constants');

module.exports = (web3, db, contracts) => {
  getCounter(db, counters.TRANSACTIONS, (r) => {
    if (r.last_processed === r.max_value) return;
  });
};
