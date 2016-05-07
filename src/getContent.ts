/// <reference path="_ref.d.ts" />

'use strict';

import Promise = require('bluebird');
import path = require('path');
import fileIO = require('./xm/fileIO');
import tsd = require('./api');
import API = require('./tsd/API');

function getAPI(options): API {
	var api = tsd.getAPI(options.config, options.verbose);
	if (options.cacheDir) {
		api.context.paths.cacheDir = path.resolve(options.cacheDir);
	}
	return api;
}

function getContent(options): Promise<any> {
	var api = getAPI(options);

	return api.readConfig(false).then(() => {
		var opts = new tsd.Options();
		opts.resolveDependencies = false;

		var query = new tsd.Query();
		query.addNamePattern('*');
		query.setVersionRange('all');
		query.parseInfo = true;

		return api.select(query, opts);
	}).then((selection) => {
		return selection.definitions.filter((def) => {
			return !def.isLegacy && def.isMain;
		}).sort(tsd.defUtil.defCompare).map((def) => {
			var ret: any = {
				project: def.project,
				name: def.name,
				path: def.path,
				semver: (def.semver || 'latest')
			};

			if (def.head.info) {
				ret.info = def.head.info;
			}

			if (def.head.dependencies) {
				ret.dependencies = def.head.dependencies.map((dep) => {
					var ret: any = {
						project: dep.project,
						name: dep.name,
						path: dep.path,
						semver: (dep.semver || 'latest')
					};
					return ret;
				});
			}

			if (def.releases) {
				ret.releases = def.releases.map((rel) => {
					var ret: any = {
						path: rel.path,
						semver: (rel.semver || null)
					};
					return ret;
				});
			}
			return ret;
		});
	}).then((content) => {
		var ret: any = {
			repo: api.context.config.repo,
			ref: api.context.config.ref,
			githubHost: api.context.config.githubHost,
			count: content.length,
			time: new Date().toISOString()
		};
		ret.urls = {
			def: ret.githubHost + '/' + ret.repo + '/blob/' + ret.ref + '/{path}'
		};
		ret.content = content;
		return ret;
	});
}

export = getContent;
