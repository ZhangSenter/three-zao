/**
 * Created by lum on 2015/8/17.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette'
], function ($, _, Backbone, Marionette) {
    'use strict';

    var tabView = Marionette.ItemView.extend({
        template: '#tpl_settings',
        tagName: 'div',
        ui: {
            about: '.about',
            help: '.help',
            complaints: '.complaints'
        },
        events: {
            'click @ui.about': 'about',
            'click @ui.help': 'help',
            'click @ui.complaints': 'complaints'
        },
        initialize: function (options) {
        },
        onRender: function () {
        },
        about: function () {
            $.alert('三灶订餐', '关于');
        },
        help: function () {
            $.alert('1."首页"查看今日菜单<br>2."我"里面查看订餐记录', '帮助');
        },
        complaints: function () {
            $.alert('请发送邮件到tracy.zhang@cloudminds.com,您的每一条意见我们一定都会认真对待!', '吐槽');
        },
    });

    return tabView;
});