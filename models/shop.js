var mongoose = require('mongoose');

var shopSchema = new mongoose.Schema({
    name: String,
    address: String,
    tel: String,
    categories: String,
    css: String
}, {collection: 'shop'});

var Shop = mongoose.model('Shop', shopSchema);
module.exports = Shop;