var db = require('../global.js').database;
db.bind('user');

exports.find = function(args) {
    return db.user.find(args);
}

exports.findOne = function(args, callback) {
    db.user.findOne(args, callback);
};

exports.insert = function(data, callback) {
    db.user.insert(data, callback);
}

exports.update = function(selector, document, options, callback){
    return db.user.update(selector, document, options, callback);
};