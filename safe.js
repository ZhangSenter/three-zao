#!/usr/bin/env node

var spawn = require('child_process').spawn,
    server = null;

function startServer(){
    console.log('start server');
    server = spawn('nohup',['node', './bin/www', '>', '2.txt', '&']);
    console.log('node js pid is '+server.pid);
    server.on('close',function(code,signal){
        console.log('close');
        console.log(arguments);
        server.kill(signal);
        server = startServer();
    });
    server.on('error',function(code,signal){
        console.log('error');
        console.log(arguments);
        server.kill(signal);
        server = startServer();
    });
    return server;
};

startServer();