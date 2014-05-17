/// <reference path="_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

Promise.onPossiblyUnhandledRejection((error) => {
	console.log('---');
	console.log(error.message);
	throw error;
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

// TODO verify process.setMaxListeners() still needs to be this high
process.setMaxListeners(20);

// dont use import
require('es6-shim');

export function noop() {
	// trick tsc into keeping the import
}
