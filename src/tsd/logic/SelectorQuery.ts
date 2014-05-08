/// <reference path="../_ref.d.ts" />

'use strict';

import pointer = require('json-pointer');
import Promise = require('bluebird');

import Def = require('../data/Def');
import DefIndex = require('../data/DefIndex');

import defUtil = require('../util/defUtil');

import Query = require('../select/Query');
import NameMatcher = require('../select/NameMatcher');
import Selection = require('../select/Selection');

import Options = require('../Options');
import Core = require('Core');
import CoreModule = require('./CoreModule');
import VError = require('verror');

class SelectorQuery extends CoreModule {

	constructor(core: Core) {
		super(core, 'select', 'Select');
	}

	/*
	 run a query against a DefIndex
	 */
	select(query: Query, options: Options): Promise<Selection> {
		var res = new Selection(query);

		return this.core.index.getIndex().then((index: DefIndex) => {
			res.definitions = query.patterns.reduce((memo: Def[], names: NameMatcher) => {
				names.filter(index.list, memo).forEach((def: Def) => {
					if (!defUtil.containsDef(memo, def)) {
						memo.push(def);
					}
				});
				return memo;
			}, []);

			if (query.versionMatcher) {
				res.definitions = query.versionMatcher.filter(res.definitions);
			}
			// default to all heads
			res.selection = defUtil.getHeads(res.definitions);

			if (options.minMatches > 0 && res.definitions.length < options.minMatches) {
				throw new VError('expected more matches %s < %s', res.definitions.length, options.minMatches);
			}
			if (options.maxMatches > 0 && res.definitions.length > options.maxMatches) {
				throw new VError('expected less matches %s > %s', res.definitions.length, options.maxMatches);
			}
		}).then(() => {
			if (query.requiresHistory) {
				if (options.limitApi > 0 && res.definitions.length > options.limitApi) {
					throw new VError('match count %s over api limit %s', res.definitions.length , options.limitApi);
				}
				return this.core.content.loadHistoryBulk(res.definitions).then(() => {
					if (query.commitMatcher) {
						res.selection = [];
						res.definitions.forEach((def: Def) => {
							def.history = query.commitMatcher.filter(def.history);
							if (def.history.length > 0) {
								res.selection.push(defUtil.getLatest(def.history));
							}
						});
						res.definitions = defUtil.getDefs(res.selection);
					}
					if (query.dateMatcher) {
						res.selection = [];
						res.definitions.forEach((def: Def) => {
							def.history = query.dateMatcher.filter(def.history);
							if (def.history.length > 0) {
								res.selection.push(defUtil.getLatest(def.history));
							}
						});
						res.definitions = defUtil.getDefs(res.selection);
					}
				});
			}
			return null;
		}).then(() => {
			if (query.requiresSource) {
				return this.core.content.loadContentBulk(res.selection);
			}
			return null;
		}).then(() => {
			if (query.parseInfo || query.infoMatcher) {
				// TODO use dateMatcher?
				return this.core.parser.parseDefInfoBulk(res.selection);
			}
			return null;
		}).then(() => {
			if (query.infoMatcher) {
				res.selection = query.infoMatcher.filter(res.selection);
				res.definitions = defUtil.getDefs(res.selection);
			}
		}).then(() => {
			if (options.resolveDependencies) {
				// TODO use dateMatcher?
				return this.core.resolver.resolveBulk(res.selection);
			}
			return null;
		}).return(res);
	}
}

export = SelectorQuery;
