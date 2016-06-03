/**
 * Module dependencies.
 */
//'use strict';
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var session = require('express-session');
const mongoose = require('mongoose');
mongoose.Promise = require('q').Promise;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var favicon = require('serve-favicon');
var morgan = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {type:'console'},
        {
            type:'file',
            filename: 'sanzao.log',
            maxLogSize: 20480,
            backups: 5,
            category: 'sanzao'
        }
    ]
});

var routes = require('./routes/index');
var admin = require('./routes/admin');
var api = require('./routes/api');
var m = require('./routes/m');
var user = require('./routes/user');

var config = require('./global').config;

var app = express();
app.disable('x-powered-by');

var MemStore = session.MemoryStore;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var logDirectory = __dirname + '/log';
// if not exists, create it
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: 'true'
});

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//app.use(require('node-sass-middleware')({
//    src: path.join(__dirname, 'public'),
//    dest: path.join(__dirname, 'public'),
//    indentedSyntax: true,
//    sourceMap: true
//}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: true
}))

//app.dynamicHelpers
app.use(function (req, res, next) {
    res.locals.session = req.session;
    next();
});

app.use('/', routes);
app.use('/admin', admin);
app.use('/api', api);
app.use('/m', m);
app.use('/user', user);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//app.use(app.router);

//app.configure('development', function () {
//    app.use(express.errorHandler());
//});

//routes(app);


// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

function connect() {
    console.log('***********connect to mongoose ***********');
    var options = {server: {socketOptions: {keepAlive: 1}}};
    return mongoose.connect(require('./global').MONGO_URL, options).connection;
}

connect()
    .on('error', console.log)
    .on('disconnected', connect);

module.exports = app;