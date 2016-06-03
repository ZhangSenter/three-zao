/**
 * Created by lum on 2015/8/17.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'juicer',
    './today_order_lst',
    './history_order_lst'
], function ($, _, Backbone, Marionette, juicer, TodayOrderListView, HistoryOrderListView) {
    'use strict';

    var tabView = Marionette.ItemView.extend({
        template: '#tpl_about_me',
        tagName: 'div',
        ui: {
            today: 'div.today',
            old: 'div.old'
        },
        tpl: $('#tpl_order_item').html().trim(),
        initialize: function (options) {
        },
        onRender: function () {
            var me = this;
            $.get('/m/user/order', function (ret) {
                //var today = juicer(me.tpl, {today: true, list: ret.today});
                //var old = juicer(me.tpl, {list: ret.old});
                me.todayOrderList = new TodayOrderListView({collection: new Backbone.Collection(ret.today)});
                me.historyOrderList = new HistoryOrderListView({collection: new Backbone.Collection(ret.old)});
                me.$el.find(me.ui.today).html(me.todayOrderList.render().$el);
                me.$el.find(me.ui.old).html(me.historyOrderList.render().$el);
            });
        }
    });

    return tabView;
});