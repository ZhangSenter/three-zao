var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    reg_name: Date,
    isAdmin: Boolean,
    canOperateShop: Boolean
}, {collection: 'user'});

var User = mongoose.model('User', userSchema);
module.exports = User;