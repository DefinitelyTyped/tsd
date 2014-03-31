/// <reference path="../_ref.d.ts" />

'use strict';

import objectUtils = require('../objectUtils');
import hash = require('../hash');

// single request, hashes to a unique id
class CacheRequest {
	key: string;
	locked: boolean;

	url: string;
	headers: any;

	localMaxAge: number;
	httpInterval: number;
	forceRefresh: boolean;

	// TODO should be Set
	static lockProps: string[] = [
		'key',
		'url',
		'headers',
		'localMaxAge',
		'httpInterval',
		'forceRefresh',
		'locked'
	];
	static keyHeaders: string[] = [
		'accept',
		'accept-charset',
		'accept-language',
		'content-md5',
		'content-type',
		'cookie',
		'host'
	];

	constructor(url: string, headers?: any) {
		this.url = url;
		this.headers = headers || {};
	}

	lock(): CacheRequest {
		this.locked = true;

		var keyHash = {
			url: this.url,
			headers: Object.keys(this.headers).reduce((memo: any, key: string) => {
				if (CacheRequest.keyHeaders.indexOf(key) > -1) {
					memo[key] = this.headers[key];
				}
				return memo;
			}, Object.create(null))
		};
		this.key = hash.jsonToIdentHash(keyHash);
		objectUtils.lockProps(this, CacheRequest.lockProps);
		// TODO maybe we should clone before freeze?
		objectUtils.deepFreeze(this.headers);
		return this;
	}
}

export = CacheRequest;
