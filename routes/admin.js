var express = require('express');
var log4js = require('log4js');
var logger = log4js.getLogger("sanzao");
logger.setLevel('INFO');
var router = express.Router();
var config = require('../global').config;
var db = require('../db');
var util = require('../libs/util');
var requiresAdminLogin = require('../middleware').requiresAdminLogin;
var requiresSuperAdminLogin = require('../middleware').requiresSuperAdminLogin;
var Shop = require('../models/shop');
var Config = require('../models/config');

/* GET admin home. */
router.get('/', requiresAdminLogin, function (req, res, next) {

    logger.info('visit admin index');

    //var shop = new Shop({
    //    name: 'aaaa'
    //});
    //shop.save();
    //
    //Shop.create({name: 'inserting ' + Date.now()}, function(err, shop) {
    //    console.log('inserting.......');
    //    console.log(err);
    //    console.log(shop);
    //});

    var query = Shop.findOne({'name': '宅食送'});
    console.log('begin compare......');
    console.log("equals :  " + query.exec() instanceof require('q').makePromise);


    Shop.findOne({'name': '宅食送'}).exec().then(function (err, results) {
        console.log('hello mongoose in then');
        console.log(arguments);
        console.log(err);
        console.log(results);
    });

    db.common.getToday(function (err, result) {
        if (!err) {
            console.log('====debug   err2222=====' + err);
            res.render('admin/index', {title: '订餐情况统计', error: err, result: result});
        } else {
            console.log('====debug   err=====' + err);
            res.render('admin/index', {title: '出现错误', error: err});
        }
    })
});

router.get('/shop', requiresAdminLogin, function (req, res, next) {
    db.shop.find({}).toArray(function (err, result) {
        if (!err) {
            res.render('admin/shop/index', {title: "店铺列表", shops: result});
        } else {
            res.render('admin/shop/index', {itle: "店铺列表", shops: []});
        }
    });
});
router.get('/shop/add', requiresAdminLogin, function (req, res, next) {
    res.render('admin/shop/add', {title: "添加店铺"});
});
router.post('/shop/add', requiresAdminLogin, function (req, res, next) {
    var name = req.body.name;
    var address = req.body.address;
    var tel = req.body.tel;

    var shop = {
        'name': name,
        'address': address,
        'tel': tel,
        'categories': req.body.categories,
        'css': req.body.css,
    };

    db.shop.insert(shop, function (err, result) {
        if (!err) {
            res.redirect('/admin/shop');
        }
    });
});
router.get('/shop/edit/:id', requiresAdminLogin, function (req, res, next) {
    db.shop.findOne({"_id": db.common.createObjectIDFromHexString(req.params.id)}, function (err, shop) {
        res.render('admin/shop/edit', {title: "店铺编辑", "shop": shop});
    });
});
router.post('/shop/edit/:id', requiresAdminLogin, function (req, res, next) {
    var shop = {
        'name': req.body.name,
        'address': req.body.address,
        'tel': req.body.tel,
        'categories': req.body.categories,
        'css': req.body.css,
    };

    db.shop.update({"_id": db.common.createObjectIDFromHexString(req.body.id)}, {'$set': shop}, function (err) {
        if (err) {
            console.log("err");
            res.redirect('/admin/shop?msg=error&action=edit');
        } else {
            res.redirect('/admin/shop?msg=success&action=edit');
        }
    })
});

/**
 * 设置为今日订餐餐厅
 */
router.post('/shop/:id/setToday', requiresAdminLogin, function (req, res, next) {
    var id = req.params.id;
    console.log('id===' + id);
    db.shop.find({}).toArray(function (err, result) {
        console.log(result);
    });
    db.shop.update({}, {'$unset': {'today': 1}}, {multi: true}, function (err) {
        if (err) {
            console.log(arguments);
            console.log(err);
            console.log('cancel failed!');
        } else {
            console.log('cancel success!');
            db.shop.update({"_id": db.common.createObjectIDFromHexString(id)}, {'$set': {'today': true}}, function (err) {
                if (err) {
                    res.status(500).json({ret: 1, error: 'update failed'});
                } else {
                    res.status(200).json({ret: 0});
                }
            })
        }
    });
});
router.get('/shop/delete/:id', requiresAdminLogin, function (req, res, next) {
    var id = req.params.id;
    db.shop.remove({"_id": db.common.createObjectIDFromHexString(id)}, function (err, result) {
        if (!err) {
            db.food.remove({"shop_id": id}, function (err) {
                if (!err) {
                    res.send(200);
                }
            })
        }
    });
});
router.get('/food/add', requiresAdminLogin, function (req, res, next) {
    db.shop.findOne({'_id': db.common.createObjectIDFromHexString(req.query['shop_id'])}, function (err, shop) {
        if (!err) {
            //获取食品
            db.food.find({'shop_id': req.query['shop_id']}).sort({category: 1}).toArray(function (err, foods) {
                if (!err) {
                    console.log(util.get_week);
                    res.render('admin/food/add', {title: "添加美食", 'shop': shop, 'foods': foods, week: util.get_week});
                } else {
                    console.log('获取店铺出错了，ID是：' + req.params.id);
                    next();
                }
            });
        } else {
            console.log('获取店铺出错了，ID是：' + req.params.id);
        }
    });
});
router.post('/food/add', requiresAdminLogin, function (req, res, next) {
    var shop_id = req.body.id;
    var name = req.body.name;
    var price = req.body.price;
    var week = req.body.week;
    var category = req.body.categories;

    var food = {
        'name': name,
        'price': price,
        'shop_id': shop_id,
        'week': week,
        'category': category
    };

    db.food.insert(food, function (err, result) {
        if (!err) {
            console.log(result);
            res.redirect('/admin/food/add?shop_id=' + shop_id);
        }
    });
});
router.get('/food/edit/:id', requiresAdminLogin, function (req, res, next) {
    db.food.findOne({"_id": db.common.createObjectIDFromHexString(req.params.id)}, function (err, food) {
        console.log(food);
        db.shop.findOne({'_id': db.common.createObjectIDFromHexString(food.shop_id)}, function (err, shop) {
            res.render('admin/food/edit', {title: "编辑美食", "food": food, "shop": shop});

        });
    });
});
router.post('/food/edit/:id', requiresAdminLogin, function (req, res, next) {
    db.food.findOne({"_id": db.common.createObjectIDFromHexString(req.params.id)}, function (err, food) {
        food.name = req.body.name;
        food.price = req.body.price;
        food.week = req.body.week;
        food.category = req.body.categories;
        delete food._id;
        db.food.update({"_id": db.common.createObjectIDFromHexString(req.params.id)}, {'$set': food}, function (err) {
            if (err) {
                console.log("err");
                res.redirect('/admin/food/edit/' + req.params.id + '?msg=error&action=edit');
            } else {
                res.redirect('/admin/food/edit/' + req.params.id + '?msg=success&action=edit');
            }
        });
    });
});
router.get('/food/delete/:id', requiresAdminLogin, function (req, res, next) {
    var id = req.params.id;
    db.food.remove({"_id": db.common.createObjectIDFromHexString(id)}, function (err, result) {
        if (!err) {
            res.send(200);
        }
    });
});
router.get('/user', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    if (req.session.user) {
        //这里如果用户有超级管理权限则能看到用户列表，否则为空白
        if (req.session.user.isAdmin) {
            var isAdmin = req.session.user.isAdmin;
            db.user.find().sort({reg_time: -1}).toArray(function (err, users) {
                return res.render('admin/user/index', {title: '用户管理', isAdmin: isAdmin, users: users})
            });
        } else {
            return res.render('admin/user/index', {title: '用户管理', isAdmin: isAdmin});
        }
    } else {
        return res.redirect(config.login_path);
    }
});
router.get('/user/orders', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    var user_id = req.query['user_id'];
    //获取当前用户的ID{user_id:req.session.user._id}
    db.order.find({user_id: user_id}).sort({time: -1}).toArray(function (err, result) {
        if (!err) {
            res.render('admin/user/orders', {title: "用户订单", orders: result});
        }
    });
});
router.get('/user/add_balance', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    var user_id = req.query['user_id'];
    var result = req.query['result'];
    db.user.findOne({"_id": db.common.createObjectIDFromHexString(user_id)}, function (err, user) {
        res.render('admin/user/add_balance', {title: "冲值", user: user, result: result});
    });
});
router.post('/user/add_balance', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    if (!req.session.user.isAdmin) {
        return
    }

    var user_id = req.body.user_id;
    var amount = req.body.amount;

    db.user.findOne({"_id": db.common.createObjectIDFromHexString(user_id)}, function (err, user) {

        var balance_log = {
            created: util.getUTC8Time("YYYY-MM-DD HH:mm:ss"),
            user_id: user_id,
            type: 'recharge',//充值
            amount: parseFloat(amount).toFixed(2),
            balance: (parseFloat(user.balance || 0) + parseFloat(amount)).toFixed(2),
            describe: req.session.user.name + "为你充值" + amount + "元人民币"
        };

        db.balanceLogs.insert(balance_log, function (err, result) {
            if (!err) {
                //修改用户余额

                user.balance = balance_log.balance;
                delete user._id;
                db.user.update({"_id": db.common.createObjectIDFromHexString(user_id)}, {'$set': user}, function (err, user) {
                    if (!err) {
                        res.redirect('admin/user/add_balance?result=success&user_id=' + user_id);
                    } else {
                        next();
                    }
                });
            }
        })

    });
});
router.get('/user/balance', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    db.user.findOne({'_id': db.common.createObjectIDFromHexString(req.query['user_id'])}, function (err, user) {
        if (!err) {
            db.balanceLogs.find({user_id: req.query['user_id']}).sort({created: -1}).toArray(function (err, balances) {
                res.render("admin/user/balance", {title: "用户记录", user: user, balances: balances});
            });
        }
    });
});
router.get('/user/delete/:id', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    var id = req.params.id;
    db.user.remove({"_id": db.common.createObjectIDFromHexString(req.params.id)}, function (err, result) {
        if (!err) {
            return res.send(200);
        }
    });
});
router.get('/user/isAdmin/:id', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    var id = req.params.id;
    db.user.findOne({"_id": db.common.createObjectIDFromHexString(id)}, function (err, user) {
        if (user.isAdmin) {
            user.isAdmin = false;
        } else {
            user.isAdmin = true;
        }
        delete user._id;
        db.user.update({"_id": db.common.createObjectIDFromHexString(id)}, {'$set': user}, function (err, result) {
            if (!err) {
                console.log(user);
                return res.send(user.isAdmin);
            }
        });
    });
});
router.get('/user/canOperateShop/:id', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    var id = req.params.id;
    db.user.findOne({"_id": db.common.createObjectIDFromHexString(id)}, function (err, user) {
        if (user.canOperateShop) {
            user.canOperateShop = false;
        } else {
            user.canOperateShop = true;
        }
        delete user._id;
        db.user.update({"_id": db.common.createObjectIDFromHexString(id)}, {'$set': user}, function (err, result) {
            if (!err) {
                return res.send(user.canOperateShop);
            }
        });
    });
});

router.get('/config', requiresAdminLogin, function (req, res, next) {
    Config.getConfig('order_config').then(function(config){
        if(!config) {
            config = {
                key: 'order_config',
                value: {
                    'startTime': '15:00',
                    'endTime': '17:30',
                    'maxOrder': '2'
                }
            };
        }
        res.render('admin/config', {title: "后台参数配置", config: config.value});
    }).catch(
        function(error) {
            console.log(error);
            res.redirect('/error');
        }
    );
});

router.post('/config', requiresAdminLogin, requiresSuperAdminLogin, function (req, res, next) {
    console.log('set config startTime: ' + req.body.startTime);

    Config.update(
        {'key': 'order_config'},
        {
            $set: {
                value: {
                    'startTime': req.body.startTime,
                    'endTime': req.body.endTime,
                    'maxOrder': Number(req.body.maxOrder)
                }
            }
        }, {upsert: true}, function (err, config) {
            console.log('update config : ' + config);
            if (err) {
                res.redirect('/error');
            } else {
                res.redirect('/admin/config');
            }
        });
});

module.exports = router;