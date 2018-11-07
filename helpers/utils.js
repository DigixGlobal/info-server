const BigNumber = require('bignumber.js');

const sumArray = function (array) {
  let sum = 0;
  for (const item of array) {
    sum += item;
  }
  return sum;
};

const bNArrayToDecimal = function (array) {
  return array.map(a => a.toNumber());
};

const sumArrayBN = function (array) {
  let sum = new BigNumber(0);
  for (const item of array) {
    sum = sum.plus(item);
  }
  return sum;
};

const getFromFunctionArg = function (transaction, argName) {
  for (const param of transaction.decodedInputs.params) {
    if (param.name === argName) {
      return param.value;
    }
  }
};

const getFromEventLog = function (res, argName) {
  for (const event of res._events) {
    for (const arg in event) {
      if (arg === argName) {
        return event[arg];
      }
    }
  }
};

module.exports = {
  sumArray,
  sumArrayBN,
  getFromFunctionArg,
  getFromEventLog,
  bNArrayToDecimal,
};
