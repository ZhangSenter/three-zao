define(function (require) {
    'use strict';
    var Marionette = require('marionette');

    var router = Marionette.AppRouter.extend({
        routes: {
            '': 'index',
            'me': 'me',
            'settings': 'settings'
        },
        initialize: function (options) {
            this.container = options.container;
        },
        index: function () {
            var me = this;
            require(['./views/index'], function (Index) {
                // 1 代表内部应用
                me.container.show(new Index({}));
            });
        },
        me: function () {
            var me = this;
            require(['./views/me'], function (Me) {
                // 1 代表内部应用
                me.container.show(new Me({}));
            });
        },
        settings: function () {
            var me = this;
            require(['./views/settings'], function (Settings) {
                // 1 代表内部应用
                me.container.show(new Settings({}));
            });
        }
    });

    return router;
});