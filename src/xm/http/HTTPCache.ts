/// <reference path="../_ref.d.ts" />

declare function setTimeout(callback: (...args: any[]) => void, ms: number, ...args: any[]): NodeTimer;
declare function clearTimeout(timeoutId: NodeTimer): void;

import path = require('path');
import Promise = require('bluebird');

import fileIO = require('../file/fileIO');
import NodeStats = require('../file/NodeStats');
import assert = require('../assert');
import assertVar = require('../assertVar');
import typeOf = require('../typeOf');

import koder = require('../lib/koder');

import CacheInfo = require('./CacheInfo');
import CacheOpts = require('./CacheOpts');
import CacheObject = require('./CacheObject');
import CacheRequest = require('./CacheRequest');
import CacheStreamLoader = require('./CacheStreamLoader');

interface CacheManage {
	lastSweep:string;
}

var mod: NodeModule = (module);
var moduleName = mod.filename;

class HTTPCache {

	static get_object = 'get_object';
	static drop_job = 'drop_job';
	static cache_clean = 'cache_clean';

	static check_cache_clean = 'check_cache_clean';
	static clean_cache_age = 'clean_cache_age';

	static dir_create = 'dir_create';
	static dir_exists = 'dir_exists';
	static dir_error = 'dir_error';

	static ignore_error = 'ignore_error';

	storeDir: string;
	opts: CacheOpts;

	infoKoder: koder.IContentKoder<CacheInfo>;
	infoSchema: any;
	proxy: string;

	private jobs = new Map<string, CacheStreamLoader>();
	private jobTimers = new Map<string, NodeTimer>();

	private _init: Promise<void>;

	private manageFile: string;
	private manageKoder: koder.IContentKoder<CacheManage>;
	private manageSchema: any;
	private cacheSweepLast: Date;

	constructor(storeDir: string, opts?: CacheOpts) {
		assertVar(storeDir, 'string', 'storeDir');
		assertVar(opts, CacheOpts, 'opts');

		this.storeDir = storeDir;
		this.opts = opts;

		this.setStoreDir(storeDir);
	}

	setStoreDir(dir: string): void {
		this.manageFile = path.join(this.storeDir, '_info.json');
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
				job = new CacheStreamLoader(this, request);
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

		if (this.opts.jobTimeout <= 0) {
			this.jobs.get(key).destruct();
			this.jobs.delete(key);
		}
		else {
			var timer: NodeTimer = setTimeout(() => {
				this.jobs.get(key).destruct();
				this.jobs.delete(key);
			}, this.opts.jobTimeout);

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
		return this._init = fileIO.exists(this.storeDir).then((exists: boolean) => {
			if (!exists) {
				return fileIO.mkdirCheckQ(this.storeDir, true).return(null);
			}
			return fileIO.isDirectory(this.storeDir).then((isDir: boolean) => {
				if (!isDir) {
					throw new Error('is not a directory: ' + this.storeDir);
				}
			});
		}).then(() => {
			// find module directory
			return fileIO.findup(path.dirname(moduleName), 'package.json').then((src: string) => {
				return path.join(path.dirname(src), 'schema');
			});
		}).then((schemaDir: string) => {
			// load info schema
			return Promise.all([
				fileIO.readJSON(path.join(schemaDir, 'cache-v1.json')).then((infoSchema: string) => {
					assertVar(infoSchema, 'object', 'infoSchema');
					this.infoSchema = infoSchema;
					this.infoKoder = new koder.JSONKoder<CacheInfo>(this.infoSchema);
				}),
				fileIO.readJSON(path.join(schemaDir, 'manage-v1.json')).then((manageSchema: string) => {
					assertVar(manageSchema, 'object', 'manageSchema');
					this.manageSchema = manageSchema;
					this.manageKoder = new koder.JSONKoder<CacheManage>(this.manageSchema);
				})
			]);
		}).return();
	}

	checkCleanCache(): Promise<void> {
		if (!this._init || !this.opts.allowClean || !typeOf.isNumber(this.opts.cacheCleanInterval)) {
			return Promise.resolve();
		}
		if (this.cacheSweepLast && this.cacheSweepLast.getTime() > Date.now() - this.opts.cacheCleanInterval) {
			return Promise.resolve();
		}

		return fileIO.exists(this.manageFile).then((exists: boolean) => {
			if (!exists) {
				return null;
			}
			return fileIO.read(this.manageFile).then((buffer: NodeBuffer) => {
				return this.manageKoder.decode(buffer).then((info: CacheManage) => {
					return info;
				}, (err) => {
					return fileIO.removeFile(this.manageFile).catch((err) => {
						// eat error
						return null;
					});
				});
			});
		}).then((manageInfo) => {
			if (manageInfo) {
				var date = new Date(manageInfo.lastSweep);
				if (date.getTime() > Date.now() - this.opts.cacheCleanInterval) {
					// fine, keep it
					return;
				}
			}

			return this.cleanupCacheAge(this.opts.cacheCleanInterval).then(() => {
				this.cacheSweepLast = new Date();
				if (!manageInfo) {
					manageInfo = {
						lastSweep: this.cacheSweepLast.toISOString()
					};
				}
				else {
					manageInfo.lastSweep = this.cacheSweepLast.toISOString();
				}
				return this.manageKoder.encode(manageInfo).then((buffer: NodeBuffer) => {
					return fileIO.write(this.manageFile, buffer);
				});
			});
		});
	}

	cleanupCacheAge(maxAge: number): Promise<void> {
		assertVar(maxAge, 'number', 'maxAge');

		return this.init().then(() => {
			var limit = Date.now() - maxAge;

			return fileIO.listTree(this.storeDir, (src: string, stat: NodeStats) => {
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

	set verbose(verbose: boolean) {
	}
}

export = HTTPCache;
