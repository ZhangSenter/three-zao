var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    shop_id:String,
    shop_name:String,
    user_id:String,
    user_name:String,
    create_time:Date,
    food_id:String,
    food_name:String,
    num:Number
}, {collection: 'order'});

var Order = mongoose.model('Config', orderSchema);
module.exports = Order;