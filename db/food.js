var db = require('../global.js').database;
db.bind('food');

exports.find = function(args) {
    return db.food.find(args);
};

exports.findOne = function(args, callback) {
    return db.food.findOne(args, callback);
};

exports.insert = function(data, callback) {
    return db.food.insert(data, callback);
};

exports.update = function(selector, document, options, callback){
    return db.food.update(selector, document, options, callback);
};