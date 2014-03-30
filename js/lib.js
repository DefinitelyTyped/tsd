var urlMod = require('url');
var path = require('path');

exports.absoluteURI = function absoluteURI(rel) {
	var u = urlMod.parse(window.location.href);
	u.pathname = path.dirname(u.pathname) + '/' + rel;
	delete u.search;
	delete u.query;
	delete u.hash;
	return urlMod.format(u);
};
