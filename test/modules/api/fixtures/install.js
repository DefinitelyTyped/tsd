/*jshint -W098*/
var lib = require('../../../lib/lib');

var installOpts = {
	overwrite: true,
	resolve: true,
	save: true
};

var tests = {
	'async': lib.extend(installOpts, {
		selector: {
			pattern: 'async'
		}
	}),
	'async-async-no-save': lib.extend(installOpts, {
		debug: false,
		save: false,
		selector: {
			pattern: 'async/async'
		}
	}),
	'bootstrap' : lib.extend(installOpts, {
		debug: false,
		selector: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'bootstrap-no-resolve' : lib.extend(installOpts, {
		debug: false,
		resolve: false,
		selector: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'bootstrap-no-overwrite' : lib.extend(installOpts, {
		debug: false,
		overwrite: false,
		modify: {
			before: {
				content : {
					'jquery/jquery.d.ts': 'foo'
				}
			}
		},
		selector: {
			pattern: 'bootstrap/bootstrap'
		}
	}),
	'chai': lib.extend(installOpts, {
		selector: {
			pattern: 'chai'
		}
	})
};

module.exports = {
	tests: tests
};
