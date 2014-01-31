/// <reference path="../../_ref.d.ts" />
/// <reference path="../../tsd/data/DefIndex.ts" />
/// <reference path="../../xm/file.ts" />
/// <reference path="../select/Selection.ts" />
/// <reference path="SubCore.ts" />

module tsd {
	'use strict';

	var Q = require('q');
	var path = require('path');
	var FS:typeof QioFS = require('q-io/fs');
	var pointer = require('json-pointer');

	export class SelectorQuery extends tsd.SubCore {

		constructor(core:tsd.Core) {
			super(core, 'select', 'Select');
		}

		/*
		 run a query against a DefIndex
		 promise: Selection
		 */
		select(query:Query, options:Options):Q.Promise<tsd.Selection> {
			var d:Q.Deferred<tsd.Selection> = Q.defer();

			this.track.promise(d.promise, 'select');

			var res = new Selection(query);

			this.core.index.getIndex().progress(d.notify).then((index:tsd.DefIndex) => {
				return Q().then(() => {
					res.definitions = query.patterns.reduce((memo:tsd.Def[], names:NameMatcher) => {
						names.filter(index.list, memo).forEach((def:tsd.Def) => {
							if (!tsd.DefUtil.containsDef(memo, def)) {
								memo.push(def);
							}
						});
						return memo;
					}, []);

					if (query.versionMatcher) {
						res.definitions = query.versionMatcher.filter(res.definitions);
					}
					// default to all heads
					res.selection = tsd.DefUtil.getHeads(res.definitions);

					if (options.minMatches > 0 && res.definitions.length < options.minMatches) {
						throw new Error('expected more matches: ' + res.definitions.length + ' < ' + options.minMatches);
					}
					if (options.maxMatches > 0 && res.definitions.length > options.maxMatches) {
						throw new Error('expected less matches: ' + res.definitions.length + ' > ' + options.maxMatches);
					}
				}).then(() => {
					if (query.requiresHistory) {
						if (options.limitApi > 0 && res.definitions.length > options.limitApi) {
							throw new Error('match count ' + res.definitions.length + ' over api limit ' + options.limitApi);
						}

						return this.core.content.loadHistoryBulk(res.definitions).progress(d.notify).then(() => {
							if (query.commitMatcher) {
								res.selection = [];
								res.definitions.forEach((def:tsd.Def) => {
									def.history = query.commitMatcher.filter(def.history);
									if (def.history.length > 0) {
										res.selection.push(tsd.DefUtil.getLatest(def.history));
									}
								});
								res.definitions = tsd.DefUtil.getDefs(res.selection);
							}
							if (query.dateMatcher) {
								res.selection = [];
								res.definitions.forEach((def:tsd.Def) => {
									def.history = query.dateMatcher.filter(def.history);
									if (def.history.length > 0) {
										res.selection.push(tsd.DefUtil.getLatest(def.history));
									}
								});
								res.definitions = tsd.DefUtil.getDefs(res.selection);
							}
						});
					}
					return null;
				}).then(() => {
					if (query.requiresSource) {
						return this.core.content.loadContentBulk(res.selection).progress(d.notify);
					}
					return null;
				}).then(() => {
					if (query.parseInfo || query.infoMatcher) {
						// TODO use dateMatcher?
						return this.core.parser.parseDefInfoBulk(res.selection).progress(d.notify);
					}
					return null;
				}).then(() => {
					if (query.infoMatcher) {
						res.selection = query.infoMatcher.filter(res.selection);
						res.definitions = tsd.DefUtil.getDefs(res.selection);
					}
					return null;
				}).then(() => {
					if (options.resolveDependencies) {
						// TODO use dateMatcher?
						return this.core.resolver.resolveBulk(res.selection).progress(d.notify);
					}
					return null;
				});
			}).then(() => {
				d.resolve(res);
			}, d.reject).done();

			return d.promise;
		}
	}
}
