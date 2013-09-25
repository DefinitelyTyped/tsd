///<reference path="../src/xm/ObjectUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />

module helper {
	'use strict';

	//settings for tests
	export var settings = {
		// control the cache used a fixture for the tests
		cache: {
			forceUpdate: false,
			allowUpdate: false
		}
	};
	//seriously cool
	xm.ObjectUtil.deepFreeze(settings);

	xm.log.debug('helper.settings', settings);
}
