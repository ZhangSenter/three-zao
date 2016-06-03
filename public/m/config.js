/**
 * Created by lum on 2015/10/8.
 */
var require = {
    shim: {
        underscore: {
            exports: '_'
        },
        'jquery': {
            exports: '$'
        },
        'sm': {
            deps: [
                'jquery'
            ],
            exports: 'jQuery.fn.sm'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        marionette: {
            deps: ['backbone','juicer'],
            exports: 'Backbone.Marionette'
        },
        juicer: {
            exports: 'juicer'
        }
    },
    paths: {
        jquery: '../js/jquery',
        underscore: '../js/underscore',
        backbone: '../js/backbone',
        marionette: '../js/backbone.marionette',
        juicer: '../js/juicer-min',
        sm: '../sui/js/sm'
    }
};