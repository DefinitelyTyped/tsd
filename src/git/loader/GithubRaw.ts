/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import assertVar = require('../../xm/assertVar');
import typeOf = require('../../xm/typeOf');
import JSONPointer = require('../../xm/lib/JSONPointer');

import CacheRequest = require('../../http/CacheRequest');
import CacheObject = require('../../http/CacheObject');

import GithubURLs = require('../GithubURLs');
import GithubLoader = require('./GithubLoader');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubRaw: get files from raw.github.com and cache on disk
 */
class GithubRaw extends GithubLoader {
	private static API_VERSION: string = '3.0.0';
	private static FORMAT_VERSION: string = '1.0';
	private static CACHE_KEY = 'git-raw-fmt' + GithubRaw.FORMAT_VERSION;

	static NAME: string = 'GithubRaw';

	constructor(urls: GithubURLs, options: JSONPointer, shared: JSONPointer, storeDir: string) {
		super(urls, options, shared, storeDir, GithubRaw.CACHE_KEY, GithubRaw.NAME, GithubRaw.FORMAT_VERSION);
	}

	getText(ref: string, filePath: string): Promise<string> {
		return this.getFile(ref, filePath).then((buffer) => {
			return buffer.toString('utf8');
		});
	}

	getJSON(ref: string, filePath: string): Promise<any> {
		return this.getFile(ref, filePath).then((buffer) => {
			return JSON.parse(buffer.toString('utf8'));
		});
	}

	getBinary(ref: string, filePath: string): Promise<Buffer> {
		return this.getFile<Buffer>(ref, filePath);
	}

	getFile<T>(ref: string, filePath: string): Promise<Buffer> {
		// should be a low hex
		assertVar(filePath, 'string', 'filePath');
		assertVar(ref, 'string', 'ref', true);

		var url = this.urls.rawFile(ref, filePath);

		var headers = {};
		var request = new CacheRequest(url, headers);

		if (typeOf.isSha(ref)) {
			request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
			request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
		}
		else {
			request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
			request.httpInterval = this.options.getDurationSecs('httpIntervalRef') * 1000;
		}
		request.lock();

		return this.cache.getObject(request).then((object: CacheObject) => {
			return object.body;
		});
	}
}

export = GithubRaw;
