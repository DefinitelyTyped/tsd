/*jshint -W098*/
var lib = require('../../../lib/lib');

var tests = {
	'async': {
		selector: {
			pattern: 'async'
		}
	},
	'async-async': {
		selector: {
			pattern: 'async/async'
		}
	},
	'angularjs-angular': {
		selector: {
			pattern: 'angularjs/angular'
		}
	}
};

module.exports = {
	tests: tests
};