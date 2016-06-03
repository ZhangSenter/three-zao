var express = require('express');
var router = express.Router();
var config = require('../global').config;
var db = require('../db');
var util = require('../libs/util');
var requiresLogin = require('../middleware').requiresLogin;

/* GET users listing. */
router.get('/', requiresLogin, function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function (req, res, next) {
    res.clearCookie(config.auth_cookie_name, {
        path: '/'
    });

    var tip = null;
    switch (req.query['tip']) {
        case 'error':
            tip = '帐号或密码错误，请重试';
            break;
        default:
            break;
    }

    res.render('user/login', {tip: tip});
});

router.post('/login', function (req, res, next) {
    var reMail = /^(?:[a-zA-Z0-9]+[_\-\+\.]?)*[a-zA-Z0-9]+@(?:([a-zA-Z0-9]+[_\-]?)*[a-zA-Z0-9]+\.)+([a-zA-Z]{2,})+$/;
    var account = req.body.account;
    var password = util.md5(req.body.password);
    var query = null;

    console.log('username: ' + req.body.account);
    console.log('password: ' + req.body.password);

    if (reMail.test(account)) {
        //使用邮箱登录
        query = {'email': account.toLowerCase(), 'password': password}
    } else {
        //使用名号登录
        query = {'name': account, 'password': password}
    }

    // 向数据库查询用户
    db.user.findOne(query, function (err, user) {
        if (!err) {
            if (user != null) {
                util.gen_session(user.name, user.password, res);
                if (user.isAdmin) {
                    res.redirect('/admin/');
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/user/login?tip=error')
            }
        } else {
            res.redirect('/user/login?tip=error')
        }
    });
});

router.get('/logout', function (req, res, next) {
    req.session.destroy();
    res.clearCookie(config.auth_cookie_name, {
        path: '/'
    });

    res.redirect('/user/login');
});

router.get('/register', function (req, res, next) {
    switch (req.query['tip']) {
        case 'notemtpy':
            var tip = "请补充完整信息";
            break;
        case 'exists_name':
            var tip = "该用户名已经被注册";
            break;
        case 'exists_email':
            var tip = "该邮箱地址已经被注册";
            break;
        case 'failure':
            var tip = "注册失败，请稍后重试";
            break
        default :
            var tip = null;
            break;
    }
    res.render('user/register', {tip: tip});
});
router.post('/register', function (req, res, next) {
    //获取用户的输入
    var name = req.body.name;
    var email = req.body.email.toLowerCase();
    var password = req.body.password;
    //验证用户空输入
    if (name == "" || password == "") {
        res.redirect('/user/register?tip=notemtpy');
        return;
    }

    //该邮箱是否已经被使用
    db.user.findOne({email: email}, function (err, name_result) {
        if (name_result == null) {//用户名未被使用
            //该用户名是否已经被使用
            db.user.findOne({name: name}, function (err, email_result) {

                if (email_result == null) {//邮箱未被使用

                    /******************************
                     * 可以注册了
                     ******************************/

                        // 密码进行MD5
                    password = util.md5(password);
                    var reg_time = util.getUTC8Time("YYYY-MM-DD HH:mm:ss");

                    // 向数据库保存用户的数据，并进行 session 保存      /*添加管理权限字段 isAdmin canOperateShop*/
                    db.user.insert({
                        'name': name,
                        'email': email,
                        'reg_time': reg_time,
                        'password': password,
                        'isAdmin': email == config.admin_user_email,
                        'canOperateShop': false
                    }, function (err, user) {
                        if (!err && user) {
                            util.gen_session(user.name, user.password, res);
                            req.session.user = user;
                            res.redirect('/?tip=welcome');
                        } else {
                            res.redirect('/user/register?tip=failure')
                        }
                    });

                } else {//名号已经被使用
                    res.redirect('/user/register?tip=exists_name')
                }
            });
        } else {//邮箱已经被使用
            res.redirect('/user/register?tip=exists_email')
        }
    });
});
router.get('/order', requiresLogin, function (req, res, next) {
    //获取当前用户的ID{user_id:req.session.user._id}
    db.order.find({user_id: req.session.user._id.toString()}).sort({time: -1}).toArray(function (err, result) {
        if (!err) {
            res.render('user/order', {orders: result});
        }
    });
});
router.get('/order/delete/:id', requiresLogin, function (req, res, next) {
});
router.get('/account', requiresLogin, function (req, res, next) {
    switch (req.query['tip']) {
        case 'empty':
            var tip = "请填写完整后再提交";
            break;
        case 'error':
            var tip = "更新错误，请重试";
            break;
        case 'old_pwd_error':
            var tip = "旧密码错误，请重试";
            break;
        case 'ok':
            var tip = "更新成功";
            break
        case 'name_exist':
            var tip = "名号已经被使用，请更换后再提交修改。";
            break;
        case 'email_exist':
            var tip = "邮箱已经被使用，请更换后再提交修改。";
            break;
        default :
            var tip = null;
            break;
    }
    db.user.findOne({'name': req.session.user.name}, function (err, result) {
        if (!err) {
            result.email = result.email || "";
            res.render('user/account', {user: result, tip: tip});
        }
    });
});
router.post('/account', requiresLogin, function (req, res, next) {
    //修改帐号
    db.user.findOne({'name': req.session.user.name}, function (err, result) {
        if (!err) {

            /* ------------ 非空验证 ----------*/
            var pwd = req.body.pwd;
            var new_pwd = req.body.new_pwd;
            var name = req.body.name;
            var email = req.body.email;
            if (name == "" || email == "" || (new_pwd != "" && pwd == "")) {
                res.redirect('/user/account?tip=empty');
                return;
            }

            result.email = email;
            result.name = name;

            //如果旧密码不为空，说明需要修改密码
            if (pwd != "") {
                //旧密码MD5
                var pwd = util.md5(req.body.pwd);
                if (result.password == pwd) {//旧密码填写正确
                    result.password = util.md5(new_pwd);
                } else {
                    res.redirect('/user/account?tip=old_pwd_error')
                    return;
                }
            }

            //验证用户名是否已经存在
            db.user.findOne({'name': result.name}, function (err, user_name_exist) {
                if (!err) {
                    //名号未被使用
                    if (( user_name_exist != null && user_name_exist._id.id == result._id.id) || user_name_exist == null) {
                        //验证邮箱是否已经被使用
                        db.user.findOne({'email': result.email}, function (err, user_email_exist) {
                            if (!err) {
                                //邮箱未被使用
                                if (( user_email_exist != null && user_email_exist._id.id == result._id.id) || user_email_exist == null) {
                                    var _id = result._id;
                                    delete result._id;

                                    db.user.update({"_id": _id}, {'$set': result}, function (err) {
                                        if (err) {
                                            res.redirect('/user/account?tip=error');
                                        } else {
                                            result._id = _id;
                                            req.session.user = result;
                                            util.gen_session(result.name, result.password, res);
                                            res.redirect('/user/account?tip=ok');
                                        }
                                    });
                                } else {
                                    res.redirect('/user/account?tip=email_exist')
                                }
                            } else {
                                res.redirect('/user/account?tip=error')
                            }
                        });
                    } else {
                        res.redirect('/user/account?tip=name_exist')
                    }
                } else {
                    res.redirect('/user/account?tip=error')
                }
            });
        }
    });
});
router.get('/balance', requiresLogin, function (req, res, next) {
    db.user.findOne({'name': req.session.user.name}, function (err, user) {
        if (!err) {
            db.balanceLogs.find({user_id: req.session.user._id.toString()}).sort({created: -1}).toArray(function (err, balances) {
                res.render("user/balance", {user: user, balances: balances});
            });
        }
    });
});
router.get('/forgetPassword', function (req, res, next) {
    switch (req.query['tip']) {
        case 'email_not_exist':
            var tip = "邮箱不存在";
            break;
        case 'success':
            var tip = "密码已发送成功请去邮箱验证";
            break;
        case 'error':
            var tip = "网络异常，请稍后再试";//此错误表示服务器问题,只要是数据库的err 统一发送此错误
            break;
        case 'sendfail':
            var tip = "发送失败，请稍后再试";//此错误表示邮件服务有问题
            break;
        default:
            var tip = null;
            break;
    }
    return res.render('user/forgetPassword', {tip: tip});
});
router.post('/forgetPassword', function (req, res, next) {
    //判断邮箱存在否
    db.user.findOne({'email': req.body.email}, function (err, result) {
        if (!err) {
            if (result) {
                var rand = Math.floor(Math.random() * 90000000);//随机生成一个数字
                var randPwd = Date.now() + rand;
                var newPassword = util.md5(String(randPwd));
                result.password = newPassword;
                delete result._id;
                db.user.update({"email": req.body.email}, {'$set': result}, function (err) {
                    if (err) {
                        res.redirect('/user/forgetPassword?tip=error');
                    } else {
                        //如果邮箱存在，则发送密码
                        util.sendMail({
                            to: req.body.email,
                            subject: 'CloudMinds新密码',
                            text: '你的新密码是：' + randPwd + '，请用此密码登陆后尽快修改密码'
                        }, function (err) {
                            if (err) return res.redirect('/user/forgetPassword?tip=sendfail');
                            res.redirect('/user/forgetPassword?tip=success');
                        });
                    }
                });
            } else {
                res.redirect('/user/forgetPassword?tip=email_not_exist');
            }
        } else {
            res.redirect('/user/forgetPassword?tip=error');
        }
    })
});

module.exports = router;