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

process.setMaxListeners(20);
