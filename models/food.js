var mongoose = require('mongoose');

var foodSchema = new mongoose.Schema({
    name: String,
    price: Number,
    shop_id: String,
    week: Number,
    category: String
}, {collection: 'food'});

var Food = mongoose.model('Food', foodSchema);
module.exports = Food;