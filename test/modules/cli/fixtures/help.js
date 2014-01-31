/*jshint -W098*/
var lib = require('../../../../lib/lib');

var tests = {
	'help': {
		command: [
			'help'
		]
	},
	'default': {
		command: [],
		fixtures: 'help'
	},
	'h-short': {
		command: [
			'-h'
		],
		fixtures: 'help'
	}
};

module.exports = {
	tests: tests
};
