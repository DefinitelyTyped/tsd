/*jshint -W098*/
var lib = require('../../../lib');

var tests = {
	'async': {
		query: {
			pattern: 'async'
		}
	},
	/*'async-commit-full': {
		query: {
			pattern: 'async',
			commit: '12978f397b2a1cd717aa29dd42c67b61e1706e06'
		}
	},
	'async-commit-short': {
		query: {
			pattern: 'async',
			commit: '12978f'
		}
	},*/
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
	},
	'angularjs-angular-legacy': {
		query: {
			pattern: 'angularjs/angular*',
			version: '1.0.0'
		}
	}
};

module.exports = {
	tests: tests
};
