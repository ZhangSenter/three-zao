var mongoose = require('mongoose');
var Q = require('q');
var Schema = mongoose.Schema;

var configSchema = new Schema({
    key: String,
    value: Schema.Types.Mixed
}, {collection: 'config'});

configSchema.statics.getConfig = function (key) {
    var deferred = Q.defer();
    this.findOne({key: key}, function (error, config) {
        if (error) {
            deferred.reject(new Error(error));
        } else {
            deferred.resolve(config);
        }
    });

    return deferred.promise;
}

var Config = mongoose.model('Config', configSchema);
module.exports = Config;