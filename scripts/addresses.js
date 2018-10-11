const getAllAddresses = (db, callback) => {
  const addresses = db.get('addresses');
  addresses.find().toArray(function (err, docs) {
    const allAddresses = docs.map((doc) => {
      return doc.address;
    });
    callback(allAddresses);
  });
};

module.exports = {
  getAllAddresses,
};
