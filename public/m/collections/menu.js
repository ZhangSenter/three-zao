define([
    'jquery',
    'underscore',
    'backbone',
    '../models/menu_item'
], function ($, _, Backbone, MenuItem) {
    'use strict';

    var menu = Backbone.Collection.extend({
        model: MenuItem,
        url: '/m/menu',
        parse: function (resp) {
            return resp;
        }
    });

    return menu;
});