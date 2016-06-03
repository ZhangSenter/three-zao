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
        template: '#tpl_tab_bar',
        tagName: 'div',
        ui: {
            tabItem: '.tab-item'
        },
        events: {
            'click @ui.tabItem': 'changeTab'
        },
        initialize: function (options) {
        },
        onRender: function () {
            var url = window.location.hash;
            console.log('url : ' + url);
            var found = false;
            $(this.ui.tabItem).each(function (i, elem) {
                var $el = $(elem);
                if ($el.attr('href') == url) {
                    found = true;
                    $el.addClass('active');
                }
            });
            if (!found) {
                $($(this.ui.tabItem)[0]).addClass('active');
            }
        },
        changeTab: function (event) {
            $(this.ui.tabItem).removeClass('active');
            $(event.currentTarget).addClass('active');
        }
    });

    return tabView;
});