/// <reference path="_ref.d.ts" />

module tsd {
	'use strict';

	var Q:typeof Q = require('q');

	// optional
	try {
		require('source-map-support').install();

		// have dev-dependencies
		Q.longStackSupport = true;
	}
	catch (e) {
		// whatever
	}

	// kill warning
	require('bufferstream').fn.warn = false;

	// future is now
	require('es6-shim');

	// booya
	if (!global.WeakMap) {
		global.WeakMap = require('weak-map');
	}

	// TODO verify process.setMaxListeners() still needs to be this high
	process.setMaxListeners(20);
}
