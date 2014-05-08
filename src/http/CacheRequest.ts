/// <reference path="../_ref.d.ts" />

'use strict';

import deepFreeze = require('deep-freeze');
import hash = require('../xm/hash');

// single request, hashes to a unique id
class Request {
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

	constructor(url: string, headers?: Object) {
		this.url = url;
		this.headers = {}; // Object.create(null);
		if (headers) {
			Object.keys(headers).forEach((key: string) => {
				this.headers[key] = headers[key];
			});
		}
	}

	lock(): Request {
		this.locked = true;

		var keyHash = {
			url: this.url,
			headers: Object.keys(this.headers).reduce((memo: any, key: string) => {
				if (Request.keyHeaders.indexOf(key) > -1) {
					memo[key] = this.headers[key];
				}
				return memo;
			}, Object.create(null))
		};
		this.key = hash.jsonToIdentHash(keyHash);
		deepFreeze(this.headers);
		Object.freeze(this);
		// TODO maybe we should clone before freeze?
		return this;
	}
}

export = Request;
