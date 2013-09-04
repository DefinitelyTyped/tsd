///<reference path="_ref.ts" />
///<reference path="./xm/io/Logger.ts" />
//

// raw file to quickly run random debug/dev code

require('source-map-support').install();

//
module dev {

	xm.log('wheee');

	var Q:QStatic = require('q');
	var Github = require('github');
	var util = require('util');
	var request = require('request');

	function testTree() {
		var api = new Github({
			version: '3.0.0'
		});

		//xm.log(util.inspect(api));

		//https://api.github.com/repos/borisyankov/DefinitelyTyped/git/trees/d5a79fa7e2f0cf36ffcd41267481b2641bcceada?recursive=1

		var params = {
			sha: 'd5a79fa7e2f0cf36ffcd41267481b2641bcceada',
			recursive: true,
			user: 'borisyankov',
			repo: 'DefinitelyTyped'
		};

		xm.log('api.data.getTree');
		api.gitdata.getTree(params, (err, res) => {
			xm.log('api.data.getTree dooone');
			xm.log(err);
			xm.log(res);
		});
	}

	function testRequest() {
		var url = 'https://raw.github.com/borisyankov/DefinitelyTyped/1eab71a53a7df593305bd9b8b27cb752cc045417/async/async.d.ts';
		var opts = {
			url: url
		};
		xm.log(opts);

		//do the actual download
		return Q.nfcall(request.get, opts).spread((res) => {
			xm.log.inspect(res, null, 0);

		}, (err) => {
			xm.log.error(err);
		});
	}

	testRequest();

}