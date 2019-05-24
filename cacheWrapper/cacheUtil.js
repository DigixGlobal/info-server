const NodeCache = require('node-cache');

const _cache = {};

const init = (options = {}) => {
  _cache.cache = new NodeCache(options);
};

const store = (key, value) => {
  _cache.cache.set(key, value);
};

const fetchMany = (keys) => {
  const values = _cache.cache.mget(keys);
  return values;
};

const fetch = (key) => {
  try {
    const value = _cache.cache.get(key, true);
    return value;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  init,
  store,
  fetch,
  fetchMany,
};
