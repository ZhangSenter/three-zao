/**
 * Created by lum on 2015/8/17.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    './order_item'
], function ($, _, Backbone, Marionette, OrderItemView) {
    'use strict';

    var TodayOrderListView = Marionette.CollectionView.extend({
        tagName: "ul",
        childView: OrderItemView,
        childViewOptions: {
            today: true
        },
        initialize: function (options) {
            var options = options || {};
            this.collection = this.options.collection;
        }
    });
    return TodayOrderListView;
});