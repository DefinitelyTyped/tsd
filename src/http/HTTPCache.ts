/// <reference path="../_ref.d.ts" />

'use strict';

// TODO invetigate why this is
declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeJS.Timer;
declare function clearTimeout(timeoutId: NodeJS.Timer): void;

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');
import Joi = require('joi');
import joiAssert = require('joi-assert');

import fileIO = require('../xm/fileIO');
import assert = require('../xm/assert');
import assertVar = require('../xm/assertVar');
import typeOf = require('../xm/typeOf');
import collection = require('../xm/collection');

import HTTPOpts = require('./HTTPOpts');

import CacheInfo = require('./CacheInfo');
import CacheOpts = require('./CacheOpts');
import CacheObject = require('./CacheObject');
import CacheRequest = require('./CacheRequest');
import CacheStreamLoader = require('./CacheStreamLoader');

import types = require('./types');

interface PathStat {
	path: string;
	atime: number;
}

class QueueItem {
	job: CacheStreamLoader;
	defer: Promise.Resolver<CacheObject>;

	constructor(job: CacheStreamLoader) {
		this.job = job;
		this.defer = Promise.defer<CacheObject>();
	}

	run(): Promise<CacheObject> {
		this.job.getObject().then((object) => {
			this.defer.resolve(object);
		}, (err) => {
			this.defer.reject(err);
		});
		return this.defer.promise;
	}

	get promise(): Promise<CacheObject> {
		return this.defer.promise;
	}
}

class HTTPCache {

	opts: HTTPOpts;

	private _init: Promise<void>;

	private jobs = new collection.Hash<Promise<CacheObject>>();
	private jobTimers = new collection.Hash<NodeJS.Timer>();

	private queue: QueueItem[] = [];
	private active: QueueItem[] = [];

	private manageFile: string;
	private cacheSweepLast: Date;

	constructor(opts: HTTPOpts) {
		assertVar(opts, 'object', 'opts');

		this.opts = opts;

		this.setStoreDir(this.opts.cache.storeDir);
	}

	setStoreDir(dir: string): void {
		assertVar(dir, 'string', 'dir');
		this.manageFile = path.join(dir, '_info.json');
	}

	getObject(request: CacheRequest): Promise<CacheObject> {
		assertVar(request, CacheRequest, 'request');
		assert(request.locked, 'request must be lock()-ed {a}', request.url);

		return this.init().then(() => {
			if (this.jobs.has(request.key)) {
				return this.jobs.get(request.key);
			}
			else {
				var job = new CacheStreamLoader(this.opts, request);
				var item = new QueueItem(job);

				this.jobs.set(request.key, item.promise);
				this.queue.push(item);

				this.checkQueue();

				return item.promise;
			}
		}).then((res: CacheObject) => {
			// start housekeeping
			this.scheduleRelease(request.key);
			this.checkCleanCache();
			// don't wait
			return res;
		});
	}

	private checkQueue(): void {
		var max = (this.opts.concurrent || 20);
		while (this.active.length < max && this.queue.length > 0) {
			this.step(this.queue.shift());
		}
	}

	private step(item: QueueItem): void {
		this.active.push(item);

		item.run().then(() => {
			var i = this.active.indexOf(item);
			if (i > -1) {
				this.active.splice(i);
			}
			this.checkQueue();
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
			this.jobs.delete(key);
		}
		else {
			var timer: NodeJS.Timer = setTimeout(() => {
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
			var ageLimit = Date.now() - maxAge;
			var dirs = Object.create(null);
			var files: PathStat[] = [];

			var baseDir = path.resolve(this.opts.cache.storeDir);

			// list tree, collect dir names & file info
			return fileIO.listTree(baseDir).map((target: string) => {
				// grab first part of relative path
				var first = path.relative(baseDir, target).match(/^[0-9a-f]+/);

				// collect main directory names
				if (first && typeOf.isString(first[0])) {
					// keeper
					if (!(first[0] in dirs)) {
						dirs[first[0]] = path.join(baseDir, first[0]);
					}
				}
				// collect files
				return fileIO.stat(target).then((stat: fs.Stats) => {
					if (stat.isFile()) {
						files.push({
							atime: stat.atime.getTime(),
							path: target
						});
					}
					return target;
				});
			}).then(() => {
				// strict filter files and find empty dirs
				var removeFiles = files.filter((obj: PathStat) => {
					var ext = path.extname(obj.path);
					var first = path.relative(baseDir, obj.path).match(/^[0-9a-f]+/);
					if (ext !== '.json' && ext !== '.raw') {
						delete dirs[first];
						return false;
					}
					var name = path.basename(obj.path, ext);
					if (!typeOf.isSha(name)) {
						delete dirs[first];
						return false;
					}
					if (maxAge > 0 && obj.atime > ageLimit) {
						delete dirs[first];
						return false;
					}
					// ok, let's delete this one
					return true;
				}).map(obj => obj.path);

				// use full paths
				var removeDirs = Object.keys(dirs).map(key => dirs[key]);

				// let's not delete files from dirs we'll be rimraffing anyway
				// sometimes OS throws errors when internal stats aren't updated after unlink (why? who knows)
				removeFiles = removeFiles.filter((file) => {
					return removeDirs.every((dir) => {
						return file.indexOf(dir) !== 0;
					});
				});

				return Promise.map(removeFiles, (target: string) => {
					return fileIO.removeFile(target);
				}).then(() => {
					return Promise.map(removeDirs, (dir: string) => {
						return fileIO.rimraf(dir);
					});
				});
			});
		}).return();
	}
}

export = HTTPCache;

