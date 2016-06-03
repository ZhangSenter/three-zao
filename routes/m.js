var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var _ = require('lodash');
var util = require('../libs/util');
var db = require('../db');
var Config = require('../models/config');

var requiresLogin = function (req, res, next) {
    console.log('====auth check ====');
    if (req.session.user) {
        console.log('====check passed ====');
        next();
    } else {
        console.log('====check failed ====');
        return res.redirect('/m/error');
    }
};

router.get('/', requiresLogin, function (req, res, next) {
    res.render('m/index');
});

router.get('/menu', requiresLogin, function (req, res, next) {
    db.shop.findOne({"today": true}, function (err, shop) {
        if (err) {
            res.status(500).json({ret: 1, err: err});
        } else {
            if(shop) {
                db.food.find({'shop_id': shop._id.toString()}).toArray(function (err, result) {
                    console.log(result);
                    res.status(200).json(result);
                });
            } else {
                res.status(200).json([]);
            }
        }
    });
});

router.post('/order', requiresLogin, function (req, res, next) {
    console.log('order dinner: ' + req.body.id);
    var foodId = req.body.id;
    console.log('---foodId ----' + foodId);






    Config.findOne({'key': 'order_config'}).exec().
     then(function (err, config) {
        // 1.判断是否到订餐时间
        if (err || !config) {
            config = {
                'startTime': '15:00',
                'endTime': '17:30',
                'maxOrder': 2
            };
        }
        res.render('admin/config', {title: "后台参数配置", config: config.value});
        // 2.判断是否超出限制
    });





    db.food.findOne({'_id': db.common.createObjectIDFromHexString(foodId)}, function (err, food) {
        if (err) {
            console.log('---err1 ----' + err);
            res.status(500).json({ret: -1, err: err});
        } else {
            console.log('---food.id ----' + food._id);
            db.shop.findOne({'_id': db.common.createObjectIDFromHexString(food.shop_id)}, function (err, shop) {
                if (err) {
                    console.log('---err2 ----' + err);
                    res.status(500).json({ret: -1, err: err});
                } else {
                    console.log('---22222222----');


                    db.order.insert({
                        shop_id: food.shop_id,
                        shop_name: shop.name,
                        user_id: req.session.user._id,
                        user_name: req.session.user.name,
                        time: util.getTodayDate(),
                        create_time: util.getUTC8Time("YYYY-MM-DD HH:mm:ss"),
                        order: [
                            {'id': food._id, name: food.name, num: 1}
                        ]
                    }, function (err, result) {
                        if (err) {
                            console.log('---err3 ----' + err);
                            console.log(err);
                            res.status(500).json({ret: -1, err: err});
                        } else {
                            console.log("==__======" + result);
                            res.json(200, {ret: 0});
                        }
                    });

                    //var today = util.getTodayDate();
                    //db.order.findOne({user_id: req.session.user._id, time: today}, function (err, order) {
                    //    if (err) {
                    //        res.status(500).json({ret: -1, err: err});
                    //    } else {
                    //        if (order == null) {
                    //            db.order.insert({
                    //                shop_id: food.shop_id,
                    //                shop_name: shop.name,
                    //                user_id: req.session.user._id,
                    //                user_name: req.session.user.name,
                    //                time: util.getTodayDate(),
                    //                create_time: util.getUTC8Time("YYYY-MM-DD HH:mm:ss"),
                    //                order: [
                    //                    {'id': food._id, name: food.name, num: 1}
                    //                ]
                    //            }, function (err, result) {
                    //                if (err) {
                    //                    console.log('---err3 ----' + err);
                    //                    console.log(err);
                    //                    res.status(500).json({ret: -1, err: err});
                    //                } else {
                    //                    console.log("==__======" + result);
                    //                    res.json(200, {ret: 0});
                    //                }
                    //            });
                    //        } else {
                    //            db.order.update({
                    //                user_id: req.session.user._id,
                    //                time: today
                    //            }, {
                    //                '$addToSet': {
                    //                    order: {
                    //                        'id': food._id,
                    //                        name: food.name,
                    //                        num: 1
                    //                    }
                    //                }
                    //            }, function (err, order) {
                    //                if (err) {
                    //                    res.status(500).json({ret: -1, err: err});
                    //                }
                    //            });
                    //        }
                    //    }
                    //});
                }
            });
        }
    });
});

router.get('/user/order', requiresLogin, function (req, res, next) {
    // userId
    var userId = req.session.user._id;
    db.order.find({'user_id': userId}).sort({'time': -1}).limit(20).toArray(function (err, orders) {
        console.log(orders);
        if (err) {
            res.status(500).json({ret: -1});
        } else {
            var today = [];
            var old = [];
            var todayDate = util.getTodayDate();
            console.log('today is :' + todayDate);
            orders.forEach(function (item, i) {
                var dt = util.getDate(item.time);
                console.log('--* ' + dt);
                // 今日订单
                if (dt == todayDate) {
                    _.each(item.order, function (food, i) {
                        today.push({id: item._id, dt: dt, name: food.name, num: food.num});
                    });
                } else {
                    // 过去订单
                    _.each(item.order, function (food, i) {
                        old.push({id: item._id, dt: dt, name: food.name, num: food.num});
                    });
                }

                console.log('i: ' + i + '   item:' + item.time);
                console.log('day: ' + util.getDate(item.time));
            });

            res.status(200).json({today: today, old: old});
        }
    });
});

router.post('/order/delete', requiresLogin, function (req, res, next) {
    var orderId = req.body.orderId;
    console.log('-------' + orderId);
    db.order.remove({'_id': db.common.createObjectIDFromHexString(orderId)}, function (err, data) {
        if (err) {
            res.status(500).json({ret: -1});
        } else {
            res.status(200).json({ret: 0});
        }
    });
});

router.get('/error', function (req, res, next) {
    res.render('m/error');
});

module.exports = router;