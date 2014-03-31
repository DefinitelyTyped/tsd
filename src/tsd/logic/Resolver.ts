/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import log = require('../../xm/log');
import fileIO = require('../../xm/file/fileIO');

import promiseUtils = require('../../xm/promise/promiseUtils');
import PromiseStash = promiseUtils.PromiseStash;

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');
import DefIndex = require('../data/DefIndex');
import defUtil = require('../util/defUtil');

import Options = require('../Options');
import Core = require('Core');
import SubCore = require('./SubCore');

var localExp = /^\.\//;
var leadingExp = /^\.\.\//;

/*
 Resolver: resolve dependencies for given def versions
 */
// TODO add unit test, verify race condition solver works properly
// TODO 'resolve' not good choice (conflicts with promises)
class Resolver extends SubCore {

	static active: string = 'active';
	static solved: string = 'solved';
	static remove: string = 'remove';
	static bulk: string = 'bulk';
	static resolve: string = 'resolve';
	static parse: string = 'parse';
	static subload: string = 'subload';
	static dep_recurse: string = 'dep_recurse';
	static dep_added: string = 'dep_added';
	static dep_missing: string = 'dep_missing';

	private _stash: PromiseStash<DefVersion>;

	constructor(core: Core) {
		super(core, 'resolve', 'Resolver');

		this._stash = new PromiseStash<DefVersion>();
	}

	/*
	 bulk version of resolveDepencendies()
	 */
	resolveBulk(list: DefVersion[]): Promise<DefVersion[]> {
		list = defUtil.uniqueDefVersion(list);

		return Promise.map(list, (file: DefVersion) => {
			return this.resolveDeps(file);
		}).return(list);
	}

	/*
	 lazy resolve a DefVersion's dependencies
	 */
	resolveDeps(file: DefVersion): Promise<DefVersion> {
		if (file.solved) {
			return Promise.cast(file);
		}
		if (this._stash.has(file.key)) {
			return this._stash.promise(file.key);
		}
		// it is not solved and not in the active list so lets load it
		return Promise.all([
			this.core.index.getIndex(),
			this.core.content.loadContent(file)
		]).spread((index: DefIndex, file: DefVersion) => {
			// force empty for robustness
			file.dependencies.splice(0, file.dependencies.length);

			var queued: Promise<DefVersion>[] = this.applyResolution(index, file, file.blob.content.toString(file.blob.encoding));
			// keep
			file.solved = true;
			return Promise.all(queued);
		}).finally(() => {
			this._stash.remove(file.key);
		}).return(file);
	}

	applyResolution(index: DefIndex, file: DefVersion, content: string): Promise<DefVersion>[] {
		var refs: string[] = this.extractPaths(file, content);

		return refs.reduce((memo: any[], refPath: string) => {
			if (index.hasDef(refPath)) {
				// use .head (could use same commit but that would be version hell with interdependent definitions)
				var dep: Def = index.getDef(refPath);
				file.dependencies.push(dep);

				// TODO decide if always to go with head or not
				// maybe it need some resolving itself?
				if (!dep.head.solved && !this._stash.has(dep.head.key)) {
					// log('recurse ' + dep.toString());

					// lets go deeper
					var p: Promise<DefVersion> = this.resolveDeps(dep.head);
					memo.push(p);
				}
			}
			else {
				log.warn('path reference not in index: ' + refPath);
				// TODO weird: could be removed file; add it? beh?
			}
			return memo;
		}, []);
	}

	extractPaths(file: DefVersion, content: string): string[] {
		// filter reasonable formed paths
		return defUtil.extractReferenceTags(content).reduce((memo: string[], refPath: string): any[] => {
			// TODO harder def-test? why?
			refPath = refPath.replace(localExp, '').replace(leadingExp, '');
			if (refPath.indexOf('/') < 0) {
				// same folder
				refPath = file.def.project + '/' + refPath;
			}
			if (Def.isDefPath(refPath) && memo.indexOf(refPath) < 0) {
				memo.push(refPath);
			}
			else {
			}
			return memo;
		}, []);
	}
}

export = Resolver;
