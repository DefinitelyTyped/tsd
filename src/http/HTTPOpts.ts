import CacheOpts = require('./CacheOpts');

interface HTTPOpts {
	cache: CacheOpts;
	proxy?: string;
	oath?: string;
}

export = HTTPOpts;
