define([
    'jquery',
    'underscore',
    'backbone',
    'marionette',
    'sm',
    './tab'
], function ($, _, Backbone, Marionette, SM, TabView) {
    'use strict';

    var layout = Marionette.LayoutView.extend({
        el: '.application',
        template: false,
        ui: {
            refresh: '.refresh'
        },
        events: {
            'click @ui.refresh': 'refresh'
        },
        regions: {
            barNav: '.bar-nav',
            barTab: '.bar-tab',
            content: '.content'
        },
        initialize: function (options) {
            this.tabView = new TabView();
            $.showPreloader();
        },
        onRender: function () {
            this.barTab.show(this.tabView);
            $.init();
            $.hidePreloader();
        },
        refresh: function () {
            window.location.href = '/ngem';
        }
    });

    return layout;
});
