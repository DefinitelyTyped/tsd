/// <reference path="_ref.d.ts" />

module tsd {
	'use strict';

	var Q:typeof Q = require('q');

	// TODO make this optional?
	Q.longStackSupport = true;

	require('source-map-support').install();

	// kill warning
	require('bufferstream').fn.warn = false;

	// improve time
	require('date-utils');

	// future is now
	require('es6-shim');

	// booya
	global.WeakMap = require('weak-map');

	// TODO verify process.setMaxListeners() still needs to be this high
	process.setMaxListeners(20);
}
