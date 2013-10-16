///<reference path="../src/xm/ObjectUtil.ts" />
///<reference path="../src/xm/Logger.ts" />

module helper {
	'use strict';

	//settings for tests
	export var settings = {
		// control the cache used a fixture for the tests
		cache: {
			allowUpdate: false,
			//do not mess with this
			forceUpdate: false
		}
	};
	//seriously cool
	xm.ObjectUtil.deepFreeze(settings);

	xm.log.debug('helper.settings', settings);
}
