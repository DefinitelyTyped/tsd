///<reference path="_ref.ts" />

//

// raw file to quickly run random debug/dev code

//

var request = require('request');
var Q:QStatic = require('q');

var getFile = function () {
	return Q.nfcall(request.get, {
		url: 'http://www.google.com'
	}).then((res) => {
		console.log('then');
		console.log(res.indexOf);
		console.dir(res);
		return String(res.body);
	});
};


getFile().done((content) => {
	console.log('done');
	console.dir(content);
});