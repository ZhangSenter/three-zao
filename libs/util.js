var crypto = require('crypto');
var config = require('../global.js').config;
var database = require('../global.js').database;
var nodemailer = require('nodemailer');
var moment = require('moment');
var _ = require('lodash');

//对moment模块的一些扩展及定义
//moment.timezoneOffset = function (zone) {
//  var diff = moment().utcOffset() + (zone * 60);
//  return moment().add(diff, 'minutes');
//};

/**
 * md5 hash
 *
 * @param str
 * @returns md5 str
 */
exports.md5 = function (str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  str = md5sum.digest('hex');
  return str;
};

/**
 * 加密函数
 * @param str 源串
 * @param secret  因子
 * @returns str
 */
exports.encrypt = function (str, secret) {
  var cipher = crypto.createCipher('aes192', secret);
  var enc = cipher.update(str, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
};

/**
 * 解密
 * @param str
 * @param secret
 * @returns str
 */
exports.decrypt = function (str, secret) {
  var decipher = crypto.createDecipher('aes192', secret);
  var dec = decipher.update(str, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

exports.gen_session = function (name, password, res) {
  var auth_token = this.encrypt(name + '\t' + password, config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 3
  }); // cookie 有效期1周
};

exports.get_week = { '-1': '全部', '0': '星期天', '1': '星期一', '2': '星期二', '3': '星期三', '4': '星期四', '5': '星期五', '6': '星期六'};

exports.getUTC8Time = function (format) {
  if (format) {
    //console.log("date == " +moment.timezoneOffset(config.time_zone).format(format));
    return moment().format(format);
  }
  else
    return moment();
};

exports.getUTC8Day = function (format) {
  return new Date(this.getUTC8Time()).getDay();
};


exports.getDate = function(timeStr) {
  return moment(timeStr).format('YYYY-MM-DD');
};

exports.getTodayDate = function() {
  return moment().format('YYYY-MM-DD');
}

var smtpConfig = {
  host: 'smtp.163.com',
  port: 25,
  secure: false, // use SSL
  auth: {
    user: 'lumtest@163.com',
    pass: '123456ABcd'
  }
};

/*初始化nodemailer*/
var transport = nodemailer.createTransport(smtpConfig);

/**
 * 发送邮件
 */
exports.sendMail = function (options, callback) {
  transport.sendMail({
    from: 'lumtest@163.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
  }, function (err, resStatus) {
    if (err) {
      console.log(err);
      callback(err);
    }
    console.log(resStatus);
    callback(null);
  });
}