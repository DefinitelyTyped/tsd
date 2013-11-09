///<reference path="helper.ts" />
///<reference path="../src/xm/ObjectUtil.ts" />
///<reference path="../src/xm/Logger.ts" />
///<reference path="../src/xm/io/HTTPCache.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export var settings = {
		// control the cache used as fixture for the tests
		cache: xm.http.HTTPCacheMode.forceLocal
	};
	//seriously cool
	xm.ObjectUtil.deepFreeze(settings);

	xm.log.debug('helper.settings', settings);
	xm.log.debug('helper.settings.cache', xm.http.HTTPCacheMode[settings.cache]);
}
