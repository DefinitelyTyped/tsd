'use strict';

var writeln = function (str) {
	console.log(str);
};

var path = require('path');
var fs = require('fs');
var util = require('util');
var mkdirp = require('mkdirp');
var tsd = require('../build/api');

function getAPI(options) {
	writeln('-> config: ' + options.config);
	var api = tsd.getAPI(options.config, options.verbose);
	if (options.cacheDir) {
		writeln('cacheDir: ' + options.cacheDir);
		api.context.paths.cacheDir = path.resolve(options.cacheDir);
	}
	return api;
}

function getIndex(options) {
	var api = getAPI(options);

	return api.readConfig(options.config, (!!options.config)).then(function () {
		var opts = new tsd.Options();
		opts.resolveDependencies = true;

		var query = new tsd.Query();
		query.addNamePattern('*');
		query.setVersionRange('all');
		query.parseInfo = true;

		return api.select(query, opts);
	}).then(function (selection) {
		return selection.definitions.filter(function(def) {
			return !def.isLegacy && def.isMain;
		}).sort(tsd.defUtil.defCompare).map(function (def) {
			var ret = {
				project: def.project,
				name: def.name,
				path: def.path,
				semver: (def.semver || 'latest')
			};

			if (def.head.info) {
				ret.info = def.head.info;
			}

			if (def.head.dependencies) {
				ret.dependencies = def.head.dependencies.map(function(dep) {
					var ret = {
						project: dep.project,
						name: dep.name,
						path: dep.path,
						semver: (dep.semver || 'latest')
					};
					return ret;
				});
			}

			if (def.releases) {
				ret.releases = def.releases.map(function(rel) {
					var ret = {
						path: rel.path,
						semver: (rel.semver || null)
					};
					return ret;
				});
			}
			return ret;
		});
	}).then(function (content) {
		var ret = {
			repo: api.context.config.repo,
			ref: api.context.config.ref,
			count: content.length,
			time: Date.now()
		};
		ret.urls = {
			def: 'https://github.com/' + ret.repo + '/blob/' + ret.ref + '/{path}'
		};
		ret.content = content;
		return ret;
	});
}

getIndex({config: path.resolve(__dirname, '..', 'tsd.json')}).then(function(index) {
	mkdirp.sync(path.resolve(__dirname, '..', 'tmp'));
	fs.writeFileSync(path.resolve(__dirname, '..', 'tmp', 'index.json'), JSON.stringify(index, null, '  '), 'utf8');
});
