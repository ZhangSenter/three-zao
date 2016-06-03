var config = require('../global').config;
var db = require('../db');
var util = require('../libs/util');

exports.requiresLogin = function (req, res, next) {
    console.log('====auth check ====');
    if (req.session.user) {
        console.log('====check passed ====');
        next();
    } else {
        console.log('====check failed, redirect to login ====');
        var cookie = req.cookies[config.auth_cookie_name];
        if (!cookie) {
            return res.redirect(config.login_path);
        }

        var auth_token = util.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
        var user_name = auth[0];

        db.user.findOne({'name': user_name}, function (err, user) {
            if (!err && user) {
                if (user.email == config.admin_user_email)
                    user.isAdmin = true;
                req.session.user = user;
                return next();
            }
            else {
                return res.redirect(config.login_path);
            }
        });
    }
};

exports.requiresAdminLogin = function (req, res, next) {
    console.log('-----admin auth check -----');
    if (req.session.user) {
        console.log('-----admin auth check success-----');
        //如果用户有管理店铺的权限或者用户时超级管理员或者为配置中的用户  才可以进入管理后台
        if (req.session.user.canOperateShop || req.session.user.isAdmin || req.session.user.email == config.admin_user_email) {
            next();
        } else {
            return res.render('note', {title: '权限不够'});
        }

    } else {
        console.log('-----admin auth fail -----');
        var cookie = req.cookies[config.auth_cookie_name];
        if (!cookie) {
            return res.redirect(config.login_path);
        }

        var auth_token = util.decrypt(cookie, config.session_secret);
        var auth = auth_token.split('\t');
        var user_name = auth[0];
        db.user.findOne({'name': user_name}, function (err, user) {
            if (!err && user) {
                if (user.email == config.admin_user_email)
                    user.isAdmin = true
                req.session.user = user;

                //如果用户有管理店铺的权限或者用户是超级管理员或者为配置中的用户  才可以进入管理后台
                if (user.canOperateShop || user.isAdmin || req.session.user.email == config.admin_user_email) {
                    return next()
                } else {
                    return res.render('note', {title: '权限不够'})
                }
            }
            else {
                return res.redirect(config.login_path);
            }
        });
    }
};

exports.requiresSuperAdminLogin = function (req, res, next) {
    console.log('-----super admin auth check -----');
    if (req.session.user) {
        console.log('-----super admin auth check success-----');
        if (req.session.user.isAdmin || req.session.user.email == config.admin_user_email) {
            next();
        } else {
            console.log('-----super admin auth check fail-----');
            return res.render('note', {title: '权限不够'});
        }
    }
}