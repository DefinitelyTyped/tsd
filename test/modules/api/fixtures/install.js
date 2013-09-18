var lib = require('./lib');

var configBase = {
	"typingsPath": "typings",
	"version": "v4",
	"repo": "borisyankov/DefinitelyTyped",
	"ref": "master",
	"installed": {}
};

var data = [
	{
		selector: { pattern: 'angularjs/angular'},
		result: [
			lib.versions.angular.head
		],
		config:  lib.extend(configBase, {"installed": {
			"angularjs/angular.d.ts": {
				"commit": "6c7c46480d7f10cde4bc42b50e61da89373d1a10",
				"hash": "560d6e337717f63943b2f351524a4949"
			},
			"jquery/jquery.d.ts": {
				"commit": "6c7c46480d7f10cde4bc42b50e61da89373d1a10",
				"hash": "d5cdf88ada90f1c989a8cac73595895b"
			}
		}})
	},
	{
		selector: { pattern: 'async/async'},
		result: [
			lib.versions.async.head
		],
		config: lib.extend(configBase, {"installed": {
			"async/async.d.ts": {
				"commit": lib.versions.async.head.commitSha,
				"hash": "fb3987f1fae34dd648c82319b8cf983b"
			}
		}})
	}
];
module.exports = data;