const mongodb = require('mongodb');
const MongoCLient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
    MongoCLient.connect(
        'mongodb+srv://Martin:gEjwFmT3B80UoL8l@cluster0.jbzftrw.mongodb.net/?retryWrites=true&w=majority'
    )
        .then((client) => {
            console.log('Connected!');
            _db = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
};

const getDb = () => {
    if (_db) {
        return _db;
    }

    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
