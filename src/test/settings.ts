/// <reference path="_ref.d.ts" />

'use strict';

import deepFreeze = require('deep-freeze');

import CacheMode = require('../http/CacheMode');

var settings = {
	// control the cache used as fixture for the tests
	cache: CacheMode.forceLocal
};
// seriously cool
deepFreeze(settings);

console.log('helper.settings.cache', CacheMode[settings.cache]);

export = settings;
