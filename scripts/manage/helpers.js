const mongoUtil = require('../../dbWrapper/mongoUtil');

const initMongoClient = async (DB_URL, DIGIXDAO_DB_NAME) => {
  await mongoUtil.connectToServer(DB_URL, DIGIXDAO_DB_NAME);
  return mongoUtil.getDB();
};

module.exports = {
  initMongoClient,
};
