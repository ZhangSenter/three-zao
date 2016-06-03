/**
 * Created by lum on 2015/8/17.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    '../models/menu_item',
    '../collections/menu'
], function ($, _, Backbone, Marionette, MenuItem, Menu) {
    'use strict';

    var MenuItemView = Marionette.ItemView.extend({
        template: '#tpl_menu_item',
        tagName: 'li',
        ui: {},
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
                        text: '定一份',
                        onClick: function () {
                            me.getOne();
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
        getOne: function () {
            //$.alert("你选择了 订饭: " + this.model.id);

            $.post('/m/order', {id: this.model.get('_id')}, function (res) {
                if(res.ret == 0) {
                    $.toast("恭喜,订餐成功了");
                }
            });
        }
    });

    var MenuView = Marionette.CollectionView.extend({
        tagName: "ul",
        childView: MenuItemView,
        childViewOptions: {
            foo: "bar"
        },
        initialize: function () {
            this.collection = new Menu();
            this.collection.fetch();
        }
    });

    return MenuView;
});