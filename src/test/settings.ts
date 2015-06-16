/// <reference path="_ref.d.ts" />

'use strict';

import deepFreeze = require('deep-freeze');

import CacheMode = require('../http/CacheMode');

module settings {
	// control the cache used as fixture for the tests
	export var apiCache = CacheMode.forceLocal;
	export var rawCache = CacheMode.forceLocal;
}
// seriously cool
deepFreeze(settings);

console.log('helper.settings.apiCache %s', CacheMode[settings.apiCache]);
console.log('helper.settings.rawCache %s', CacheMode[settings.rawCache]);

export = settings;
