/// <reference path="_ref.d.ts" />

'use strict';

import deepFreeze = require('deep-freeze');

import CacheMode = require('../http/CacheMode');
import log = require('../xm/log');

var settings = {
	// control the cache used as fixture for the tests
	cache: CacheMode.forceLocal
};
// seriously cool
deepFreeze(settings);

log.debug('helper.settings.cache', CacheMode[settings.cache]);

export = settings;
