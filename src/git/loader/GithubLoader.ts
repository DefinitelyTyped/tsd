/// <reference path="../../_ref.d.ts" />
/// <reference path="../../xm/object.ts" />
/// <reference path="../../xm/Logger.ts" />
/// <reference path="../../xm/file.ts" />
/// <reference path="../../xm/http/HTTPCache.ts" />
/// <reference path="../GithubRepo.ts" />

module git {
	'use strict';

	var path = require('path');

	/*
	 GithubRaw: get files from raw.github.com and cache on disk
	 */
	export class GithubLoader {

		repo:git.GithubRepo;
		track:xm.EventLog;

		cache:xm.http.HTTPCache;
		options:xm.JSONPointer;

		storeDir:string;

		label:string = 'github-loader';
		formatVersion:string = '0.0.0';

		headers = {};

		constructor(repo:git.GithubRepo, options:xm.JSONPointer, storeDir:string, prefix:string, label:string) {
			xm.assertVar(repo, git.GithubRepo, 'repo');
			xm.assertVar(options, xm.JSONPointer, 'options');
			xm.assertVar(storeDir, 'string', 'storeDir');

			this.repo = repo;
			this.options = options;
			this.storeDir = storeDir;
			this.label = label;
			this.track = new xm.EventLog(prefix, label);
		}

		_initGithubLoader(lock?:string[]):void {
			var opts = new xm.http.CacheOpts();
			opts.allowClean = this.options.getBoolean('allowClean', opts.allowClean);
			opts.cacheCleanInterval = this.options.getDurationSecs('cacheCleanInterval', opts.cacheCleanInterval / 1000) * 1000;
			opts.splitDirLevel = this.options.getNumber('splitDirLevel', opts.splitDirLevel);
			opts.splitDirChunk = this.options.getNumber('splitDirChunk', opts.splitDirChunk);
			opts.jobTimeout = this.options.getDurationSecs('jobTimeout', opts.jobTimeout / 1000) * 1000;

			this.cache = new xm.http.HTTPCache(path.join(this.storeDir, this.getCacheKey()), opts);

			xm.object.lockProps(this, ['repo', 'cache', 'options', 'storeDir', 'track', 'label', 'formatVersion']);
			if (lock) {
				xm.object.lockProps(this, lock);
			}
			// required to have some header
			this.headers['user-agent'] = this.label + '-v' + this.formatVersion;
		}

		getCacheKey():string {
			// override
			return 'loader';
		}

		copyHeadersTo(target:any, source?:any) {
			source = (source || this.headers);
			Object.keys(source).forEach((name) => {
				target[name] = source[name];
			});
		}

		set verbose(verbose:boolean) {
			this.track.logEnabled = verbose;
			this.cache.verbose = verbose;
		}
	}
}
