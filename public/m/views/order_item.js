define([
    'jquery',
    'underscore',
    'backbone',
    'marionette'
], function ($, _, Backbone, Marionette) {
    'use strict';

    var OrderItemView = Marionette.ItemView.extend({
        template: '#tpl_order_item',
        tagName: 'li',
        className: 'item-content',
        ui: {},
        templateHelpers: function () {
            return {
                today: this.options.today
            }
        },
        initialize: function (options) {
            this.options = options || {};
            this.model = this.options.model;
        },
        onRender: function () {
            var me = this;
            this.$el.click(function () {
                var buttons1 = [
                    {
                        text: '请选择',
                        label: true
                    },
                    {
                        text: '取消 ' + me.model.get('name'),
                        onClick: function () {
                            me.cancelOrder();
                        }
                    }
                ];
                var buttons2 = [
                    {
                        text: '取消',
                        bg: 'danger'
                    }
                ];
                var groups = [buttons1, buttons2];
                $.actions(groups);
            });
        },
        cancelOrder: function () {
            var me = this;
            $.post('/m/order/delete', {orderId: this.model.id}, function (data) {
                //alert(data.ret);
                me.model.collection.remove(me.model);
            });
        }
    });

    return OrderItemView;
});