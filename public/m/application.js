/**
 * 全局app对象
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    './views/layout'
], function ($, _, Backbone, Marionette, LayoutView) {
    'use strict';

    var application = Marionette.Application.extend({
        initialize: function () {
            this.$body = $(document.body);
            this.layout = new LayoutView();
            this.layout.render();
        }
    });

    return application;
});