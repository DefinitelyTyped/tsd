/// <reference path="../_ref.d.ts" />

import CacheMode = require('./CacheMode');

class CacheOpts {
	// TODO implement and integrate compressStore with CacheInfo and streaming downloader
	compressStore: boolean = false;

	splitDirLevel: number = 0;
	splitDirChunk: number = 1;

	cacheRead = true;
	cacheWrite = true;
	remoteRead = true;

	// must be explicitly enabled
	allowClean = false;
	cacheCleanInterval: number;

	jobTimeout: number = 0;

	constructor(mode?: CacheMode) {
		if (mode) {
			this.applyCacheMode(mode);
		}
	}

	applyCacheMode(mode: CacheMode) {
		switch (mode) {
			case CacheMode.forceRemote:
				this.cacheRead = false;
				this.remoteRead = true;
				this.cacheWrite = false;
				this.allowClean = false;
				break;
			case CacheMode.forceUpdate:
				this.cacheRead = false;
				this.remoteRead = true;
				this.cacheWrite = true;
				this.allowClean = true;
				break;
			case CacheMode.allowUpdate:
				this.cacheRead = true;
				this.remoteRead = true;
				this.cacheWrite = true;
				this.allowClean = true;
				break;
			case CacheMode.forceLocal:
				this.cacheRead = true;
				this.remoteRead = false;
				this.cacheWrite = false;
				this.allowClean = false;
				break;
			case CacheMode.allowRemote:
			default:
				this.cacheRead = true;
				this.remoteRead = true;
				this.cacheWrite = false;
				this.allowClean = false;
				break;
		}
	}
}

export = CacheOpts;
