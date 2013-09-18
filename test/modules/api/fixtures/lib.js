/*jshint -W003*/
function copyTo(source, target) {
	target = target || {};
	var name;
	var value;
	if (source) {
		for (name in source) {
			if (source.hasOwnProperty(name)) {
				value = source[name];
				if (typeof value === 'object' && value) {
					target[name] = extend(value);
				}
				else {
					target[name] = value;
				}
			}
		}
	}
	return target;
}
function extend(source) {
	var ret = {};
	copyTo(source, ret);
	for (var i = 1, ii = arguments.length; i < ii; i++) {
		copyTo(arguments[i], ret);
	}
	return ret;
}

var hash = {
	headCommit: '6c7c46480d7f10cde4bc42b50e61da89373d1a10'
};

var versions = {
	angular: {
		head: {
			solved: false,
			dependencies: [],
			commitSha: hash.headCommit
		}
	},
	async: {
		head: {
			solved: false,
			dependencies: [],
			commitSha: hash.headCommit
		}
	}
};

var defs = {
	angular: {
		path: 'angularjs/angular.d.ts',
		project: 'angularjs',
		name: 'angular',
		history: [],
		head: versions.angular.head
	},
	async: {
		path: 'async/async.d.ts',
		project: 'async',
		name: 'async',
		history: [],
		head: versions.async.head
	}
};


module.exports = {
	copyTo: copyTo,
	extend: extend,
	hash: hash,
	versions: versions,
	defs: defs
};