var lib = require('./lib');

var configBase = {
	"typingsPath": "typings",
	"version": "v4",
	"repo": "borisyankov/DefinitelyTyped",
	"ref": "master",
	"installed": {}
};

//TODO find way to auto-update hashes
var data = [
	{
		selector: { pattern: 'angularjs/angular'},
		result: [
			lib.versions.angular.head
		],
		config: lib.extend(configBase, {"installed": {
			"jquery/jquery.d.ts": {
				"commit": lib.versions.angular.head.commitSha,
				"hash": "d5cdf88ada90f1c989a8cac73595895b"
			},
			"angularjs/angular.d.ts": {
				"commit": lib.versions.angular.head.commitSha,
				"hash": "1d7b590a99a17087749dbeaa9f2cbd0e"
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