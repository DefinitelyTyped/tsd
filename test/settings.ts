module helper {
	'use strict';

	//settings for tests
	export var settings = {
		cache: {
			forceUpdate: false,
			allowUpdate: false
		}
	};
	//seriously
	Object.freeze(settings.cache);

	xm.log.debug('helper.settings', settings);
}
