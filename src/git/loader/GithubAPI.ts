/// <reference path="../_ref.d.ts" />

'use strict';

import request = require('request');
import Promise = require('bluebird');

import typeOf = require('../../xm/typeOf');
import JSONPointer = require('../../xm/json/JSONPointer');
import koder = require('../../xm/lib/koder');

import CacheRequest = require('../../xm/http/CacheRequest');
import CacheObject = require('../../xm/http/CacheObject');

import GithubRepo = require('../GithubRepo');
import GithubLoader = require('./GithubLoader');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubAPI: access github rest-api with local cache (evading the non-auth rate-limit)
 */
/// <reference path="../_ref.d.ts" />

// TODO add OAuth support (here or in HTTPCache)
class GithubAPI extends GithubLoader {

	static get_cachable = 'get_cachable';
	static get_rate = 'get_rate';

	// github's version
	private apiVersion: string = '3.0.0';

	constructor(repo: GithubRepo, options: JSONPointer, storeDir: string) {
		super(repo, options, storeDir, 'github-api', 'GithubAPI');

		this.formatVersion = '1.0';

		this._initGithubLoader();
	}

	getBranches(): Promise<any> {
		return this.getCachableURL(this.repo.urls.apiBranches());
	}

	getBranch(branch: string): Promise<any> {
		return this.getCachableURL(this.repo.urls.apiBranch(branch));
	}

	getTree(sha: string, recursive: boolean): Promise<any> {
		return this.getCachableURL(this.repo.urls.apiTree(sha, (recursive ? 1 : undefined)));
	}

	getCommit(sha: string): Promise<any> {
		return this.getCachableURL(this.repo.urls.apiCommit(sha));
	}

	getBlob(sha: string): Promise<any> {
		return this.getCachableURL(this.repo.urls.apiBlob(sha));
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
		return this.getCachableURL(this.repo.urls.apiPathCommits(path));
	}

	getCachableURL(url: string): Promise<any> {
		var request = new CacheRequest(url);
		return this.getCachable(request, true);
	}

	getCachable(request: CacheRequest, addMeta: boolean): Promise<any> {
		// TODO add some specific validation
		var k: koder.IContentKoder<any> = koder.JSONKoder.main;

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
			return k.decode(object.body).then((res: any) => {
				if (object.response) {
					var rate = new GithubRateInfo(object.response.headers);
					/*d.progress({
						message: rate.toString(),
						data: rate
					});*/
				}
				if (addMeta && typeOf.isObject(res)) {
					res.meta = {rate: rate};
				}
				return res;
			});
		});
	}

	getRateInfo(): Promise<GithubRateInfo> {
		return new Promise((resolve: (info: GithubRateInfo) => void, reject) => {
			var url = this.repo.urls.rateLimit();
			var req: any = {
				url: url,
				headers: {}
			};
			this.copyHeadersTo(req.headers);

			if (this.cache.proxy) {
				req.proxy = this.cache.proxy;
			}
			/*d.progress({
				message: 'get url: ' + url
			});*/
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
