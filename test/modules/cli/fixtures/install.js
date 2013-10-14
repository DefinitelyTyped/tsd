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
	}
};

module.exports = {
	command: ['install'],
	tests: tests
};
