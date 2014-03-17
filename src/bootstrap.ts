/// <reference path="_ref.d.ts" />

import Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection((error) => {
	console.log('---');
	console.log(error.message);
	throw error;
	process.exit(1);
});

// optional
try {
	require('source-map-support').install();

	// have dev-dependencies
	Promise.longStackTraces();
}
catch (e) {
	// whatever
}

// kill warning
var bufferstream = require('bufferstream');
bufferstream.fn.warn = false;

// future is now

// TODO verify process.setMaxListeners() still needs to be this high
process.setMaxListeners(20);

// dont use import
require('es6-shim');

export function noop() {

}
