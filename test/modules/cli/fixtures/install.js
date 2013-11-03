/*jshint -W098*/
var lib = require('../../../lib/lib');

var installOpts = {
	overwrite: true,
	resolve: true,
	save: true
};

var tests = {
	'async': lib.extend(installOpts, {
		save: true,
		selector: {
			pattern: 'async'
		}
	}),
	'async-async': lib.extend(installOpts, {
		selector: {
			pattern: 'async/async'
		}
	})
};

module.exports = {
	command: ['install'],
	tests: tests
};
