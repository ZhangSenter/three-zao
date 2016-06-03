var db = require('../global.js').database;
db.bind('balance_logs');

exports.find = function(args) {
    return db.balance_logs.find(args);
}

exports.findOne = function(args, callback) {
    db.balance_logs.findOne(args, callback);
};

exports.insert = function(data, callback) {
    db.balance_logs.insert(data, callback);
}
