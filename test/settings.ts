///<reference path="helper.ts" />
///<reference path="../src/xm/ObjectUtil.ts" />
///<reference path="../src/xm/Logger.ts" />
///<reference path="../src/xm/io/CachedLoader.ts" />
///<reference path="../src/tsd/Core.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	//TODO CacheMode enum and helpers could be promoted to core code? could be nice as CLI/config parameter
	export enum CacheMode {
		forceLocal,
		forceRemote,
		forceUpdate,
		allowRemote,
		allowUpdate,
	}

	export function applyCoreUpdate(core:tsd.Core) {
		applyCoreUpdateLoader(core.gitAPI.loader);
		applyCoreUpdateLoader(core.gitRaw.loader);
	}

	//set modes for fixture updates
	export function applyCoreUpdateLoader(loader:xm.CachedLoader<any>) {
		var opts = loader.options;

		switch (helper.settings.cache) {
			case CacheMode.forceRemote:
				opts.cacheRead = false;
				opts.remoteRead = true;
				opts.cacheWrite = false;
				break;
			case CacheMode.forceUpdate:
				opts.cacheRead = false;
				opts.remoteRead = true;
				opts.cacheWrite = true;
				break;
			case CacheMode.allowUpdate:
				opts.cacheRead = true;
				opts.remoteRead = true;
				opts.cacheWrite = true;
				break;
			case CacheMode.allowRemote:
				opts.cacheRead = true;
				opts.remoteRead = true;
				opts.cacheWrite = false;
				break;
			case CacheMode.forceLocal:
			default:
				opts.cacheRead = true;
				opts.remoteRead = false;
				opts.cacheWrite = false;
				break;
		}
	}

	//TODO update to verify exacter using the event/log solution when it's ready (xm.EventLog)
	export function assertUpdateStat(loader:xm.CachedLoader<any>, message:string) {
		var stats = loader.stats;
		var sum:number;
		switch (helper.settings.cache) {
			case CacheMode.forceRemote:
				assert.operator(stats.get('cache-hit'), '===', 0, message + ': allRemote: cache-hit');
				assert.operator(stats.get('load-success'), '>', 0, message + ': allRemote: load-success');
				assert.operator(stats.get('write-success'), '===', 0, message + ': allRemote: write-success');
				break;
			case CacheMode.forceUpdate:
				assert.operator(stats.get('cache-hit'), '===', 0, message + ': forceUpdate: cache-hit');

				sum = stats.get('load-success') + stats.get('write-success');
				assert.operator(sum, '>', 0, message + ': forceUpdate: sum (load-success + write-success)');
				break;
			case CacheMode.allowUpdate:
				//assert.operator(stats.get('cache-hit'), '>=', 0, message + ': allowUpdate: cache-hit');
				//assert.operator(stats.get('load-success'), '>=', 0, message + ': allowUpdate: load-success');
				//assert.operator(stats.get('write-success'), '>=', 0, message + ': allowUpdate: write-success');

				sum = stats.get('load-success') + stats.get('write-success') + stats.get('cache-hit');
				assert.operator(sum, '>', 0, message + ': allowUpdate: sum (load-success + write-success + cache-hit)');
				break;
			case CacheMode.allowRemote:
				assert.operator(stats.get('write-success'), '==', 0, message + ': allowRemote: write-success');

				sum = stats.get('load-success') + stats.get('cache-hit');
				assert.operator(sum, '>', 0, message + ': allowRemote: sum (load-success + cache-hit)');
				break;
			case CacheMode.forceLocal:
			default:
				assert.operator(stats.get('cache-hit'), '>', 0, message + ': noUpdate: cache-hit');
				assert.operator(stats.get('load-success'), '===', 0, message + ': noUpdate: load-success');
				assert.operator(stats.get('write-success'), '===', 0, message + ': noUpdate: write-success');
				break;
		}
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export var settings = {
		// control the cache used as fixture for the tests
		cache: CacheMode.forceLocal
	};
	//seriously cool
	xm.ObjectUtil.deepFreeze(settings);

	xm.log.debug('helper.settings', settings);
}
