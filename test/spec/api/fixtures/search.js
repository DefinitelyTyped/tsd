/*jshint -W098*/
var lib = require('../../../lib');

var tests = {
	'async': {
		query: {
			pattern: 'async'
		}
	},
	'async-commit-full': {
		query: {
			pattern: 'async',
			commit: '6cfdabc5b280210fab2c3ccf834c8289e05c619e'
		}
	},
	'async-commit-short': {
		query: {
			pattern: 'async',
			commit: '6cfdab'
		}
	},
	'async-history': {
		query: {
			pattern: 'async',
			history: true
		}
	},
	'async-info': {
		query: {
			pattern: 'async',
			info: true
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
