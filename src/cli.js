#!/usr/bin/env node

// note: it is critical this file has unix line-endings

var errHandler = require('./tsd/util/error-handler');

process.on('uncaughtException', function(err) {
	errHandler.handler(err);
});

setTimeout(function() {
    require('./bootstrap');
    require('./tsd/CLI').runARGV(process.argv);
}, 500);
