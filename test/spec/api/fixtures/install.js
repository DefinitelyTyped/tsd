/*jshint -W098*/
var lib = require('../../../lib');

var installOpts = {
	overwrite: true,
	resolve: true,
	save: true
};

var tests = {
	'async': lib.clone(installOpts, {
		query: {
			pattern: 'async'
		}
	}),
	'async-async-no-save': lib.clone(installOpts, {
		debug: false,
		save: false,
		query: {
			pattern: 'async/async'
		}
	}),
	'bootstrap': lib.clone(installOpts, {
		debug: false,
		query: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'bootstrap-no-resolve': lib.clone(installOpts, {
		debug: false,
		resolve: false,
		query: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'bootstrap-no-overwrite': lib.clone(installOpts, {
		debug: false,
		overwrite: false,
		modify: {
			before: {
				content: {
					'jquery/jquery.d.ts': 'foo'
				}
			}
		},
		query: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'chai': lib.clone(installOpts, {
		query: {
			pattern: 'chai'
		}
	})
};

module.exports = {
	tests: tests
};
