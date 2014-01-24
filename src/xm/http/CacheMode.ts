/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 module xm {
	'use strict';

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export module http {

		export enum CacheMode {
			forceLocal = 1,
			forceRemote,
			forceUpdate,
			allowRemote,
			allowUpdate
		}

		export class CacheOpts {
			// TODO implement and integrate compressStore with CacheInfo and streaming downloader
			compressStore:boolean = false;

			splitKeyDir:number = 0;

			cacheRead = true;
			cacheWrite = true;
			remoteRead = true;

			// must be explicitly enabled
			allowClean = false;
			cacheCleanInterval:number;

			constructor(mode?:CacheMode) {
				if (mode) {
					this.applyCacheMode(mode);
				}
			}

			applyCacheMode(mode:CacheMode) {
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
					case CacheMode.allowRemote:
						this.cacheRead = true;
						this.remoteRead = true;
						this.cacheWrite = false;
						this.allowClean = false;
						break;
					case CacheMode.forceLocal:
					default:
						this.cacheRead = true;
						this.remoteRead = false;
						this.cacheWrite = false;
						this.allowClean = false;
						break;
				}
			}
		}
	}
}
