/*jshint -W098*/
var lib = require('../../../../lib/lib');

var tests = {
	'async': {
		debug: true,
		query: {
			pattern: 'async'
		}
	}
};

module.exports = {
	command: ['query'],
	tests: tests
};