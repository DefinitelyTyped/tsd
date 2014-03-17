/// <reference path="_ref.d.ts" />

import chai = require('chai');
import assert = chai.assert;

import CacheMode = require('../xm/http/CacheMode');
import objectUtils = require('../xm/objectUtils');
import log = require('../xm/log');

var settings = {
	// control the cache used as fixture for the tests
	cache: CacheMode.forceLocal
};
// seriously cool
objectUtils.deepFreeze(settings);

log.debug('helper.settings.cache', CacheMode[settings.cache]);

export = settings;
