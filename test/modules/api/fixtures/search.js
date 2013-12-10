/*jshint -W098*/
var lib = require('../../../../lib/lib');

var tests = {
	'async': {
		query: {
			pattern: 'async'
		}
	},
	'bootstrap': {
		query: {
			pattern: 'bootstrap'
		},
		resolve: true
	},
	'angularjs-angular-all': {
		query: {
			pattern: 'angularjs/angular*'
		}
	}
};

module.exports = {
	tests: tests
};