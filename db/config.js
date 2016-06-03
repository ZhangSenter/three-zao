var db = require('../global.js').database;
db.bind('config');

exports.find = function (args) {
    return db.config.find(args);
};

exports.findOne = function (args, callback) {
    return db.config.findOne(args, callback);
};

exports.insert = function (data, callback) {
    return db.config.insert(data, callback);
};

exports.update = function (selector, document, options, callback) {
    return db.config.update(selector, document, options, callback);
};