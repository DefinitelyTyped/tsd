var request = require('request');
var util = require('util');
var fs = require('fs');
var zlib = require('zlib');
var MemoryStream = require('memorystream');
var es = require('event-stream');
var BufferStream = require('bufferstream');

require('es6-shim');

var req = {
	url: 'http://localhost:63342/tsd-origin/package.json'
};

//var writer = fs.createWriteStream('./tmp/file.json');
var writer = new BufferStream({size:'flexible'});
var pause = es.pause();
pause.pause();
/*
request.get(req).on('response', function (res) {
	console.log('response');
	console.log(util.inspect(res, null, 0));
	console.log(util.inspect(res.headers, null, 0));
	switch (res.headers['content-encoding']) {
		case 'gzip':
			pause.pipe(zlib.createGunzip()).pipe(writer);
			break;
		case 'deflate':
			pause.pipe(zlib.createInflate()).pipe(writer);
			break;
		default:
			pause.pipe(writer);
			break;
	}
	writer.on('end',function () {
		console.log('end');
		console.log(writer.getBuffer().toString('utf8'));
	}).on('error', function (err) {
		console.log('error');
		console.log(util.inspect(err, null, 0));
	});
	pause.resume();
}).pipe(pause);*/

var map = new Map();
map.set(1, 2);
console.log(map.get(1));
