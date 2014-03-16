/// <reference path="../_ref.d.ts" />

import Promise = require('bluebird');

import assertVar = require('../../xm/assertVar');
import typeOf = require('../../xm/typeOf');
import JSONPointer = require('../../xm/json/JSONPointer');

import CacheRequest = require('../../xm/http/CacheRequest');
import CacheObject = require('../../xm/http/CacheObject');
import koder = require('../../xm/lib/koder');

import GithubRepo = require('../GithubRepo');
import GithubLoader = require('./GithubLoader');
import GithubRateInfo = require('../model/GithubRateInfo');

/*
 GithubRaw: get files from raw.github.com and cache on disk
 */
class GithubRaw extends GithubLoader {

	static get_file: string = 'get_file';

	constructor(repo: GithubRepo, options: JSONPointer, storeDir: string) {
		super(repo, options, storeDir, 'github-raw', 'GithubRaw');

		this.formatVersion = '1.0';

		this._initGithubLoader();
	}

	getText(ref: string, filePath: string): Promise<string> {
		return this.getFile<string>(ref, filePath, koder.StringKoder.utf8);
	}

	getJSON(ref: string, filePath: string): Promise<any> {
		return this.getFile<any>(ref, filePath, koder.JSONKoder.main);
	}

	getBinary(ref: string, filePath: string): Promise<NodeBuffer> {
		return this.getFile<NodeBuffer>(ref, filePath, koder.ByteKoder.main);
	}

	getFile<T>(ref: string, filePath: string, koder: koder.IContentKoder<T>): Promise<T> {
		// should be a low hex
		assertVar(filePath, 'string', 'filePath');
		assertVar(koder, 'object', 'koder');
		assertVar(ref, 'string', 'ref', true);

		var url = this.repo.urls.rawFile(ref, filePath);

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
			return koder.decode(object.body);
		}).then((res: T) => {
			return res;
		});
	}

	getCacheKey(): string {
		return 'git-raw-fmt' + this.formatVersion;
	}
}

export = GithubRaw;
