var db = require('../global.js').database;
db.bind('order');

exports.find = function(args) {
    return db.order.find(args);
}

exports.findOne = function(args, callback) {
    db.order.findOne(args, callback);
};

exports.insert = function(data, callback) {
    db.order.insert(data, callback);
}

exports.update = function(selector, document, options, callback){
    return db.order.update(selector, document, options, callback);
};

exports.remove = function(data, callback) {
    return db.order.remove(data, callback);
}