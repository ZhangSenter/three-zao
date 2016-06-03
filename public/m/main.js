require(['jquery',
        'underscore',
        'backbone',
        'marionette',
        'juicer',
        './application',
        './router'
    ],
    function ($, _, Backbone, Marionette, juicer, Application, Router) {
        'use strict';

        Marionette.Renderer.render = function (template, data) {
            if (!template) {
                return "";
            }
            // 如果指定的是元素id，则根据id获取模板内容
            if (template.indexOf('#') == 0) {
                var tpl = $(template).html();
                return juicer(tpl, data);
            }
            return juicer(template, data);
        };

        // stop sui router
        $.smConfig = {router: false};

        var application = new Application();
        window.application = application;
        application.router = new Router({
            container: application.layout.content
        });
        Backbone.history.start();
    });