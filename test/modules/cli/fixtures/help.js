/*jshint -W098*/
var lib = require('../../../lib/lib');

var tests = {
	'default': {
		command: []
	},
	'h-short': {
		command: [
			'-h'
		]
	},
	'help': {
		command: [
			'help'
		]
	}
};

module.exports = {
	tests: tests
};
