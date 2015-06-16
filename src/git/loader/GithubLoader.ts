/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');

import assertVar = require('../../xm/assertVar');
import HTTPCache = require('../../http/HTTPCache');
import HTTPOpts = require('../../http/HTTPOpts');
import CacheOpts = require('../../http/CacheOpts');

import JSONPointer = require('../../xm/lib/JSONPointer');

import GithubURLs = require('../GithubURLs');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubLoader: base class
 */
class GithubLoader {

	urls: GithubURLs;

	cache: HTTPCache;
	options: JSONPointer;
	shared: JSONPointer;

	storeDir: string;

	label: string = 'github-loader';
	formatVersion: string = '0.0.0';

	headers = {};

	constructor(urls: GithubURLs, options: JSONPointer, shared: JSONPointer, storeDir: string, prefix: string, label: string) {
		assertVar(urls, GithubURLs, 'urls');
		assertVar(options, JSONPointer, 'options');
		assertVar(shared, JSONPointer, 'shared');
		assertVar(storeDir, 'string', 'storeDir');

		this.urls = urls;
		this.options = options;
		this.shared = shared;
		this.storeDir = storeDir;
		this.label = label;
	}

	_initGithubLoader(): void {
		var cache = new CacheOpts();
		cache.allowClean = this.options.getBoolean('allowClean', cache.allowClean);
		cache.cleanInterval = this.options.getDurationSecs('cacheCleanInterval', cache.cleanInterval / 1000) * 1000;
		cache.splitDirLevel = this.options.getNumber('splitDirLevel', cache.splitDirLevel);
		cache.splitDirChunk = this.options.getNumber('splitDirChunk', cache.splitDirChunk);
		cache.jobTimeout = this.options.getDurationSecs('jobTimeout', cache.jobTimeout / 1000) * 1000;
		cache.storeDir = path.join(this.storeDir, this.getCacheKey());

		var opts: HTTPOpts = {
			cache: cache,
			concurrent: this.shared.getNumber('concurrent', 20),
			oath: this.shared.getString('oath', null),
			strictSSL: this.shared.getBoolean('strictSSL', true)
		};

		opts.proxy = (this.shared.getString('proxy')
			|| process.env.HTTPS_PROXY
			|| process.env.https_proxy
			|| process.env.HTTP_PROXY
			|| process.env.http_proxy
			);

		this.cache = new HTTPCache(opts);
		// required to have some header
		this.headers['user-agent'] = this.label + '-v' + this.formatVersion;
	}

	getCacheKey(): string {
		// override
		return 'loader';
	}

	copyHeadersTo(target: any, source?: any) {
		source = (source || this.headers);
		Object.keys(source).forEach((name) => {
			target[name] = source[name];
		});
	}

	set verbose(verbose: boolean) {

	}
}

export = GithubLoader;
