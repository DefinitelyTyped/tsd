/*jshint -W098*/
var lib = require('../../../../lib/lib');

var tests = {
	'async': {
		selector: {
			pattern: 'async'
		}
	},
	'bootstrap': {
		selector: {
			pattern: 'bootstrap'
		},
		resolve: true
	},
	'angularjs-angular-all': {
		selector: {
			pattern: 'angularjs/angular*'
		}
	}
};

module.exports = {
	tests: tests
};