/// <reference path="../_ref.d.ts" />

'use strict';

// TODO invetigate why this is
declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timer;
declare function clearTimeout(timeoutId: NodeJS.Timer): void;

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');
import Joi = require('joi');
import joiAssert = require('joi-assert');

import fileIO = require('../xm/file/fileIO');
import assert = require('../xm/assert');
import assertVar = require('../xm/assertVar');
import typeOf = require('../xm/typeOf');

import HTTPOpts = require('./HTTPOpts');

import CacheInfo = require('./CacheInfo');
import CacheOpts = require('./CacheOpts');
import CacheObject = require('./CacheObject');
import CacheRequest = require('./CacheRequest');
import CacheStreamLoader = require('./CacheStreamLoader');

import types = require('./types');

class HTTPCache {

	opts: HTTPOpts;

	private jobs = new Map<string, CacheStreamLoader>();
	private jobTimers = new Map<string, NodeJS.Timer>();

	private _init: Promise<void>;

	private manageFile: string;
	private cacheSweepLast: Date;

	constructor(opts: HTTPOpts) {
		assertVar(opts, 'object', 'opts');

		this.opts = opts;

		this.setStoreDir(this.opts.cache.storeDir);
	}

	setStoreDir(dir: string): void {
		this.manageFile = path.join(dir, '_info.json');
	}

	getObject(request: CacheRequest): Promise<CacheObject> {
		assertVar(request, CacheRequest, 'request');
		assert(request.locked, 'request must be lock()-ed {a}', request.url);

		return this.init().then(() => {
			var job: CacheStreamLoader;

			if (this.jobs.has(request.key)) {
				job = this.jobs.get(request.key);
			}
			else {
				job = new CacheStreamLoader(this.opts, request);
				this.jobs.set(request.key, job);
			}
			return job.getObject();
		}).then((res: CacheObject) => {
			// start housekeeping
			this.scheduleRelease(request.key);
			this.checkCleanCache();
			// don't wait
			return res;
		});
	}

	private scheduleRelease(key: string): void {
		if (!this.jobs.has(key)) {
			return;
		}
		if (this.jobTimers.has(key)) {
			clearTimeout(this.jobTimers.get(key));
		}

		if (this.opts.cache.jobTimeout <= 0) {
			this.jobs.get(key).destruct();
			this.jobs.delete(key);
		}
		else {
			var timer: NodeJS.Timer = setTimeout(() => {
				this.jobs.get(key).destruct();
				this.jobs.delete(key);
			}, this.opts.cache.jobTimeout);

			// non-block
			timer.unref();

			this.jobTimers.set(key, timer);
		}
	}

	private init(): Promise<void> {
		if (this._init) {
			return this._init;
		}
		// first create directory
		return this._init = fileIO.mkdirCheck(this.opts.cache.storeDir, true).return();
	}

	checkCleanCache(): Promise<void> {
		if (!this._init || !this.opts.cache.allowClean || !typeOf.isNumber(this.opts.cache.cleanInterval)) {
			return Promise.resolve();
		}
		if (this.cacheSweepLast && this.cacheSweepLast.getTime() > Date.now() - this.opts.cache.cleanInterval) {
			return Promise.resolve();
		}

		return fileIO.exists(this.manageFile).then((exists: boolean) => {
			if (!exists) {
				return null;
			}
			return fileIO.read(this.manageFile).then((buffer: Buffer) => {
				return joiAssert(JSON.parse(buffer.toString('utf8')), types.manageSchema);
			}, (err) => {
				// remove borked file
				return fileIO.removeFile(this.manageFile).catch((err) => {
					// eat error
					return null;
				});
			});
		}).then((manageInfo) => {
			if (manageInfo) {
				var date = new Date(manageInfo.lastSweep);
				if (date.getTime() > Date.now() - this.opts.cache.cleanInterval) {
					// fine, keep it
					return;
				}
			}
			// clean cache
			return this.cleanupCacheAge(this.opts.cache.cleanInterval).then(() => {
				this.cacheSweepLast = new Date();
				if (!manageInfo) {
					manageInfo = {
						lastSweep: this.cacheSweepLast.toISOString()
					};
				}
				else {
					manageInfo.lastSweep = this.cacheSweepLast.toISOString();
				}
				return fileIO.write(this.manageFile, new Buffer(JSON.stringify(manageInfo, null, 2), 'utf8'));
			});
		});
	}

	cleanupCacheAge(maxAge: number): Promise<void> {
		assertVar(maxAge, 'number', 'maxAge');

		return this.init().then(() => {
			var limit = Date.now() - maxAge;

			return fileIO.listTree(this.opts.cache.storeDir, (src: string, stat: fs.Stats) => {
				if (stat.isFile()) {
					var ext = path.extname(src);
					if (ext !== '.json') {
						return false;
					}
					var name = path.basename(src, ext);
					if (!typeOf.isSha(name)) {
						return false;
					}
					if (stat.atime.getTime() > limit) {
						return false;
					}
					// kill it
					return true;
				}
				return false;
			});
		}).then((tree: string[]) => {
			return Promise.map(tree, (src: string) => {
				return Promise.all([
					fileIO.removeFile(src),
					fileIO.removeFile(src.replace(/\.json$/, '.raw'))
				]).then(() => {
					// d.progress('dropped from cache: ' + src);
				}, (err) => {
					// eat error
				});
			});
		}).return();
	}
}

export = HTTPCache;

