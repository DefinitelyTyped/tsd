/// <reference path="../_ref.d.ts" />

'use strict';

import request = require('request');
import ReqOptions = request.Options;
import Promise = require('bluebird');

import typeOf = require('../../xm/typeOf');
import JSONPointer = require('../../xm/json/JSONPointer');

import CacheRequest = require('../../http/CacheRequest');
import CacheObject = require('../../http/CacheObject');

import GithubURLs = require('../GithubURLs');
import GithubLoader = require('./GithubLoader');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubAPI: access github rest-api with local cache (evading the non-auth rate-limit)
 */
/// <reference path="../_ref.d.ts" />

// TODO add OAuth support (here or in HTTPCache)
class GithubAPI extends GithubLoader {

	// github's version
	private apiVersion: string = '3.0.0';

	constructor(urls: GithubURLs, options: JSONPointer, storeDir: string) {
		super(urls, options, storeDir, 'github-api', 'GithubAPI');

		this.formatVersion = '1.0';

		this._initGithubLoader();
	}

	getBranches(): Promise<any> {
		return this.getCachableURL(this.urls.apiBranches());
	}

	getBranch(branch: string): Promise<any> {
		return this.getCachableURL(this.urls.apiBranch(branch));
	}

	getTree(sha: string, recursive: boolean): Promise<any> {
		return this.getCachableURL(this.urls.apiTree(sha, (recursive ? 1 : undefined)));
	}

	getCommit(sha: string): Promise<any> {
		return this.getCachableURL(this.urls.apiCommit(sha));
	}

	getBlob(sha: string): Promise<any> {
		return this.getCachableURL(this.urls.apiBlob(sha));
	}

	/*
	 getCommits(sha:string):Promise<any> {
	 //TODO implement result pagination
	 var params = this.mergeParams({
	 per_page: 100,
	 sha: sha
	 });
	 }
	 */

	getPathCommits(path: string): Promise<any> {
		// TODO implement result pagination
		return this.getCachableURL(this.urls.apiPathCommits(path));
	}

	getCachableURL(url: string): Promise<any> {
		var request = new CacheRequest(url);
		return this.getCachable(request);
	}

	getCachable(request: CacheRequest): Promise<any> {
		if (!typeOf.isNumber(request.localMaxAge)) {
			request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
		}
		if (!typeOf.isNumber(request.httpInterval)) {
			request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
		}
		this.copyHeadersTo(request.headers);

		request.headers['accept'] = 'application/vnd.github.beta+json';
		request.lock();

		return this.cache.getObject(request).then((object: CacheObject) => {
			var res = JSON.parse(object.body.toString('utf8'));
			if (object.response) {
				var rate = new GithubRateInfo(object.response.headers);
				if (typeOf.isObject(res)) {
					res.meta = {rate: rate};
				}
			}
			return res;
		});
	}

	getRateInfo(): Promise<GithubRateInfo> {
		return new Promise((resolve: (info: GithubRateInfo) => void, reject) => {
			var url = this.urls.rateLimit();
			var req: ReqOptions = {
				url: url,
				headers: {}
			};
			this.copyHeadersTo(req.headers);

			if (this.cache.opts.proxy) {
				req.proxy = this.cache.opts.proxy;
			}
			request.get(req, (err, res, body) => {
				if (err) {
					reject(err);
				}
				else {
					var rate = new GithubRateInfo(res.headers);
					resolve(rate);
				}
			});
		});
	}

	getCacheKey(): string {
		return 'git-api-v' + this.apiVersion + '-fmt' + this.formatVersion;
	}
}

export = GithubAPI;
