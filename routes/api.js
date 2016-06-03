var express = require('express');
var router = express.Router();
var config = require('../global').config;
var db = require('../db');
var util = require('../libs/util');
var requiresLogin = require('../middleware').requiresLogin;

/* GET users listing. */
router.post('/login', function (req, res, next) {
    var account = req.body.account;
    var uid = req.body.uid;
    var query = {'name': account, 'uid': uid};
    console.log('query');
    console.log(query);
    db.user.findOne(query, function (err, user) {
        //
        if (!err) {
            if (user != null) {
                console.log('old user');
                util.gen_session(user.name, user.password, res);
                req.session.user = user;
                res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
                res.write(JSON.stringify({'url': '/m?tip=welcome', 'user': user}));
                res.end();
            } else {
                console.log('new user');
                var password = util.md5('111111');
                var reg_time = util.getUTC8Time("YYYY-MM-DD HH:mm:ss");
                var email = 'test@cloudminds.com';

                // 向数据库保存用户的数据，并进行 session 保存      /*添加管理权限字段 isAdmin canOperateShop*/
                db.user.insert({
                    'name': account,
                    'uid': uid,
                    'email': email,
                    'reg_time': reg_time,
                    'password': password,
                    'isAdmin': email == config.admin_user_email,
                    'canOperateShop': false
                }, function (err, user) {
                    if (!err && user) {
                        util.gen_session(user.name, user.password, res);
                        req.session.user = user;
                        //res.writeHead(200, {'Content-Type': 'application/json; charset=UTF-8'});
                        //res.write(JSON.stringify());
                        res.json(200, {'url': '/m?tip=welcome', 'user': user});
                        res.end();
                    } else {
                        res.send({error: '保存用户失败'});
                    }
                });
            }

        } else {
            res.send({error: '查找用户时出现错误!'});
        }
    });
});

module.exports = router;