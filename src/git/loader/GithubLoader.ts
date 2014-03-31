/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');

import assertVar = require('../../xm/assertVar');
import HTTPCache = require('../../xm/http/HTTPCache');
import CacheOpts = require('../../xm/http/CacheOpts');

import objectUtils = require('../../xm/objectUtils');
import eventLog = require('../../xm/lib/eventLog');
import JSONPointer = require('../../xm/json/JSONPointer');

import GithubRepo = require('../GithubRepo');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubLoader: base class
 */
class GithubLoader {

	repo: GithubRepo;

	cache: HTTPCache;
	options: JSONPointer;

	storeDir: string;

	label: string = 'github-loader';
	formatVersion: string = '0.0.0';

	headers = {};

	constructor(repo: GithubRepo, options: JSONPointer, storeDir: string, prefix: string, label: string) {
		assertVar(options, JSONPointer, 'options');
		assertVar(storeDir, 'string', 'storeDir');

		this.repo = repo;
		this.options = options;
		this.storeDir = storeDir;
		this.label = label;
	}

	_initGithubLoader(): void {
		var opts = new CacheOpts();
		opts.allowClean = this.options.getBoolean('allowClean', opts.allowClean);
		opts.cacheCleanInterval = this.options.getDurationSecs('cacheCleanInterval', opts.cacheCleanInterval / 1000) * 1000;
		opts.splitDirLevel = this.options.getNumber('splitDirLevel', opts.splitDirLevel);
		opts.splitDirChunk = this.options.getNumber('splitDirChunk', opts.splitDirChunk);
		opts.jobTimeout = this.options.getDurationSecs('jobTimeout', opts.jobTimeout / 1000) * 1000;

		this.cache = new HTTPCache(path.join(this.storeDir, this.getCacheKey()), opts);
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
		this.cache.verbose = verbose;
	}
}

export = GithubLoader;
