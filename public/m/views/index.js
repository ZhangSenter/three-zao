/**
 * Created by lum on 2015/8/17.
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    './notice',
    './menu'
], function ($, _, Backbone, Marionette, Notice, Menu) {
    'use strict';

    var indexView = Marionette.ItemView.extend({
        template: '#tpl_index',
        tagName:'div',
        ui: {
            notice: '.notice',
            menu: '.menu'
        },
        initialize: function (options) {
            this.notice = new Notice();
            this.menu = new Menu();
        },
        onRender: function () {
            $(this.ui.notice).html(this.notice.render().$el);
            $(this.ui.menu).html(this.menu.render().$el);
        }
    });

    return indexView;
});