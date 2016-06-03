var db = require('../global.js').database;
db.bind('shop');

exports.find = function(args) {
    return db.shop.find(args);
}

exports.findOne = function(args, callback) {
    db.shop.findOne(args, callback);
};

exports.insert = function(data, callback) {
    db.shop.insert(data, callback);
}

exports.update = function(selector, document, options, callback){
    return db.shop.update(selector, document, options, callback);
};