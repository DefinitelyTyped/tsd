/*jshint -W098*/
var lib = require('../../../lib/lib');

var tests = {
	'async': {
		selector: {
			pattern: 'async'
		}
	},
	'angular': {
		selector: {
			pattern: 'angular'
		}
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