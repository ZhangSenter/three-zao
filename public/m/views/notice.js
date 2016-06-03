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

    var noticeView = Marionette.ItemView.extend({
        template: '#tpl_notice',
        tagName: 'div',
        className: 'card',
        ui: {},
        initialize: function (options) {
        },
        onRender: function () {
        }
    });

    return noticeView;
});