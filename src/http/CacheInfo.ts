/// <reference path="../_ref.d.ts" />

// meta data to keep on disk
interface CacheInfo {
	url:string;
	key:string;
	contentType:string;
	httpETag:string;
	httpModified:string;
	cacheCreated:string;
	cacheUpdated:string;
	contentChecksum:string;
}

export = CacheInfo;
