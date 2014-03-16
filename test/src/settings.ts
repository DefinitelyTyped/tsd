import chai = require('chai');
import assert = chai.assert;

import CacheMode = require('../../src/xm/http/CacheMode');
import objectUtils = require('../../src/xm/objectUtils');
import log = require('../../src/xm/log');

var settings = {
	// control the cache used as fixture for the tests
	cache: CacheMode.forceLocal
};
// seriously cool
objectUtils.deepFreeze(settings);

log.debug('helper.settings.cache', CacheMode[settings.cache]);

export = settings;
