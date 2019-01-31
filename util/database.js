const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db

const mongoConnect = cb => {
  MongoClient.connect('mongodb://localhost:27017/udemy-node')
    .then(client => {
      _db = client.db();
      cb(client);
    })
    .catch(err => {
      console.log(err);
      throw err;
    });
}

const getDb = () => {
  if (_db) {
    return _db
  }
  throw 'No database found!';
}

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;