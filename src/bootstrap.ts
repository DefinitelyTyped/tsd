///<reference path="_ref.d.ts" />

module tsd {
	var Q:typeof Q = require('q');
	Q.longStackSupport = true;

	require('source-map-support').install();

	// kill warning
	require('bufferstream').fn.warn = false;

	// future is now
	require('es6-shim');

	//TODO verify process.setMaxListeners() still needs to be this high
	process.setMaxListeners(20);
}
