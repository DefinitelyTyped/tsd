import CacheOpts = require('./CacheOpts');

interface HTTPOpts {
	cache: CacheOpts;
	concurrent?: number;
	proxy?: string;
	oath?: string;
}

export = HTTPOpts;
