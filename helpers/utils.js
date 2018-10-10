const BigNumber = require('bignumber.js');

const sumArray = function (array) {
  let sum = 0;
  for (const item in array) {
    sum += item;
  }
  return sum;
};

const sumArrayBN = function (array) {
  let sum = new BigNumber(0);
  for (const item in array) {
    sum = sum.plus(item);
  }
  return sum;
};

module.exports = {
  sumArray,
  sumArrayBN,
};
