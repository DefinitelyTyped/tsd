/*jshint -W098*/
var lib = require('../../../lib/lib');

var installOpts = {
	overwrite: true,
	resolve: true,
	save: true
};

var tests = {
	/*'async': lib.extend(installOpts, {
		save: true,
	    query: {
			pattern: 'async'
		}
	}),
	'async-async': lib.extend(installOpts, {
		query: {
			pattern: 'async/async'
		}
	})*/
};

module.exports = {
	command: ['query'],
	tests: tests
};
