/// <reference path="../_ref.d.ts" />

import CacheRequest = require('./CacheRequest');
import CacheInfo = require('./CacheInfo');
import ResponseInfo = require('./ResponseInfo');

// a represent a single object in the cache
class CacheObject {
	request: CacheRequest;
	storeDir: string;

	infoFile: string;
	info: CacheInfo;

	response: ResponseInfo;

	bodyFile: string;
	bodyChecksum: string;
	body: NodeBuffer;

	constructor(request: CacheRequest) {
		this.request = request;
	}
}

export = CacheObject;
