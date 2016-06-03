var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var util = require('../libs/util');
var db = require('../db');
var requiresLogin = require('../middleware').requiresLogin;

/* GET home page. */
router.get('/', requiresLogin, function(req, res, next) {
    console.log('----visit index------');
    db.shop.find().toArray(function (err, shops) {
        console.log('---------------');
        console.log(err);
        if (!err) {
            res.render('index', {'shops': shops})
        } else {
            next();
        }
    });
});

router.get('/ngem', function(req, res, next){
    res.render('ngem');
});

/* handle 404 error*/
//router.get('*', function (req, res, next) {
//    console.log('404 handler..');
//    res.render('404', {status: 404, title: '页面不存在'});
//});

router.get('/today', requiresLogin, function(req, res, next){
    db.common.getToday(function (err, result) {
        if (err) {
            res.render('today', { error: 'null'});
        } else {
            res.render('today', result);
        }
    })
});


router.get('/shop/:id', requiresLogin, function (req, res, next) {
    db.shop.findOne({'_id': db.common.createObjectIDFromHexString(req.params.id)}, function (err, shop) {
        if (!err) {
            //获取今天的星期
            var week = util.getUTC8Day().toString();
            db.food.find({
                'shop_id': req.params.id,
                week: {$in: ['-1', week]}
            }).sort({category: 1}).toArray(function (err, foods) {
                if (!err) {

                    //进行分组处理
                    var group = [];
                    for (var i = 0; i < foods.length; i++) {
                        var category = foods[i].category;//分类
                        if (category) {
                            var index = category.split('#');
                            if (!group[index[0]]) {
                                //不存在这个分类，需要创建这个数组
                                group[index[0]] = {'name': index[1], 'foods': []}
                            }

                            //向该分类推入这个商品
                            group[index[0]].foods.push(foods[i]);

                        } else {
                            console.log(foods.name + "没有无法确定分类");
                        }
                    }
                    //检查有没有图片菜单
                    (function (cb) {
                        if (shop.picmenu) {
                            shop.picmenu = "data:image/jpeg;base64," + shop.picmenu.buffer.toString('base64');
                            cb();
                        } else {
                            fs.exists(path.join(__dirname, '..', 'public', 'picmenu' + req.params.id + '.jpg'), function (exists) {
                                shop.picmenu = exists ? '/picmenu' + req.params.id + '.jpg' : '';
                                //页面渲染
                                cb();
                            });
                        }
                    })(function (err) {
                        res.render('shop', {'shop': shop, 'group': group});
                    });
                } else {
                    console.log('获取店铺出错了，ID是：' + req.params.id + ":error" + err);
                    next();
                }
            });
        } else {
            console.log('获取店铺出错了，ID是：' + req.params.id);
            next();
        }
    });
});
router.post('/submit_order', requiresLogin, function (req, res, next) {
    //计算运气
    var luck = Math.floor(Math.random() * 100);

    //获取订单
    var order_list = JSON.parse(req.body.list);
    var shop_id = req.body.shop_id;
    var shop_name = req.body.shop_name;

    var total = 0.0;
    for (var i in order_list) {
        total = total + ( parseFloat(order_list[i].price) * parseInt(order_list[i].num));
    }

    //插入订单
    db.order.insert({
        shop_id: shop_id,
        shop_name: shop_name,
        user_id: req.session.user._id,
        user_name: req.session.user.name,
        time: util.getUTC8Time("YYYY-MM-DD HH:mm:ss"),
        total: total,
        order: order_list,
        luck: luck,
        canceled: false,
        payStatus: 'deafult'
    }, function (err, result) {
        if (!err) {
            console.log(result);
            res.send('{"result":"success","luck":"' + luck + '"}');
        } else {
            console.log(err);
            res.send('{"result":"error"}');
        }
    })
});
router.get('/pay/item', requiresLogin, function (req, res, next) {
    //获取订单号
    var order_id = req.query["order_id"];

    //获取订单信息、x
    db.order.findOne({_id: db.common.createObjectIDFromHexString(order_id)}, function (err, order) {
        if (!err) {

            db.user.findOne({'name': req.session.user.name}, function (err, user) {
                if (!err) {
                    res.render('pay/item', {order: order, user: user});
                }
            });

        } else {
            next();
        }
    });
});
router.get('/pay/submit_pay', requiresLogin, function (req, res, next) {
    var result = req.query['result'];
    db.user.findOne({"_id": db.common.createObjectIDFromHexString(req.session.user._id.toString())}, function (err, user) {
        res.render('pay/submit_pay', {user: user, result: result});
    });
});
router.post('/pay/submit_pay', requiresLogin, function (req, res, next) {
    var order_id = req.body.order_id;
    //查询订单
    db.order.findOne({_id: db.common.createObjectIDFromHexString(order_id)}, function (err, order) {
        if (!err) {
            //如果该订单已经支付，返回今日订单界面
            if (order.payStatus === "paid") {
                res.redirect('/today');
                return;
            }
            //---------开始进行付款流程------------------
            db.user.findOne({"name": req.session.user.name}, function (err, user) {
                if (!err) {

                    //添加余额变动记录
                    var balance_log = {
                        created: util.getUTC8Time("YYYY-MM-DD HH:mm:ss"),
                        user_id: user._id.toString(),
                        type: 'pay',//充值
                        amount: parseFloat(0 - order.total).toFixed(2),
                        balance: (parseFloat(user.balance || 0) + parseFloat(0 - order.total)).toFixed(2),
                        describe: "支付了 <a href=\"/shop/" + order.shop_id + "\">" + order.shop_name + "</a> 的订单 › <a href=\"/user/order#order-" + order._id + "\">查看订单详情</a>"
                    };

                    db.balanceLogs.insert(balance_log, function (err, result) {
                        if (!err) {
                            //修改用户帐户余额
                            db.user.update({"_id": user._id}, {'$set': {"balance": balance_log.balance}}, function (err) {
                                if (!err) {
                                    //修改订单支付状态
                                    db.order.update({"_id": order._id}, {'$set': {"payStatus": "paid"}}, function (err) {
                                        if (!err) {
                                            res.redirect('/pay/submit_pay?result=success');
                                        } else {
                                            next();
                                        }
                                    });
                                } else {
                                    next();
                                }
                            });
                        }
                    })
                }
            });
        } else {
            res.send({"err": "application error"});
        }
    });
});

module.exports = router;