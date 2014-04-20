var urlMod = require('url');
var path = require('path');

exports.absoluteURI = function absoluteURI(rel) {
	var u = urlMod.parse(window.location.href);
	if (!/\/$/.test(u.pathname)) {
		u.pathname = path.dirname(u.pathname);
	}
	u.pathname = u.pathname.replace(/\/?$/,'/') + rel;
	delete u.search;
	delete u.query;
	delete u.hash;
	delete u.href;
	return urlMod.format(u);
};
