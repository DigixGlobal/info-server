const {
  MongoClient,
} = require('mongodb');

let _db;

const connectToServer = async (url, dbName) => {
  const client = await MongoClient.connect(
    url,
    { useNewUrlParser: true },
  );
  _db = client.db(dbName);
};

const getDB = () => {
  return _db;
};

module.exports = {
  connectToServer,
  getDB,
};
