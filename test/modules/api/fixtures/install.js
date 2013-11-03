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
	'angular-cookies': lib.extend(installOpts, {
		selector: {
			pattern: 'angularjs/angular-cookies'
		}
	}),
	'angular-cookies-no-resolve': lib.extend(installOpts, {
		resolve: false,
		selector: {
			pattern: 'angularjs/angular-cookies'
		}
	}),
	'angular-cookies-no-overwrite': lib.extend(installOpts, {
		debug: false,
		overwrite: false,
		selector: {
			pattern: 'angularjs/angular-cookies'
		},
		modify: {
			before: {
				content : {
					'jquery/jquery.d.ts': 'foo'
				}
			}
		},
		written: [
			'angularjs/angular-cookies.d.ts',
			'angularjs/angular.d.ts'
		]
	}),
	'chai-assert': lib.extend(installOpts, {
		selector: {
			pattern: 'chai-assert'
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
