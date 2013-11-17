///<reference path="../data/DefUtil.ts" />
///<reference path="../data/Def.ts" />
///<reference path="../data/DefVersion.ts" />
///<reference path="../data/DefBlob.ts" />
///<reference path="SubCore.ts" />
///<reference path="../../xm/promise.ts" />

module tsd {
	'use strict';

	var Q:typeof Q = require('q');

	var leadingExp = /^\.\.\//;

	/*
	 Resolver: resolve dependencies for given def versions
	 */
	//TODO add unit test,  verify race condition solver works properly
	//TODO 'resolve' not good choice (conflicts with promises)
	export class Resolver extends tsd.SubCore {

		static active:string = 'active';
		static solved:string = 'solved';
		static remove:string = 'remove';
		static bulk:string = 'bulk';
		static resolve:string = 'resolve';
		static parse:string = 'parse';
		static subload:string = 'subload';
		static dep_recurse:string = 'dep_recurse';
		static dep_added:string = 'dep_added';
		static dep_missing:string = 'dep_missing';

		private _stash:xm.PromiseStash<tsd.DefVersion>;

		constructor(core:tsd.Core) {
			super(core, 'resolve', 'Resolver');

			this._stash = new xm.PromiseStash<tsd.DefVersion>();
		}

		/*
		 bulk version of resolveDepencendies()
		 promise: array: bulk results of single calls
		 */
		resolveBulk(list:tsd.DefVersion[]):Q.Promise<tsd.DefVersion[]> {
			var d:Q.Deferred<tsd.DefVersion[]> = Q.defer();

			this.track.promise(d.promise, Resolver.bulk);

			list = tsd.DefUtil.uniqueDefVersion(list);

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.resolveDeps(file);

			})).then(() => {
				d.resolve(list);
			}, (err) => {
				d.reject(err);
			}).done();

			return d.promise;
		}

		/*
		 lazy resolve a tsd.DefVersion's dependencies
		 promise: tsd.DefVersion: with .dependencies resolved (recursive)
		 */
		resolveDeps(file:tsd.DefVersion):Q.Promise<tsd.DefVersion> {
			if (file.solved) {
				this.track.skip(Resolver.solved);
				return Q(file)(file);
			}
			if (this._stash.has(file.key)) {
				this.track.skip(Resolver.active);
				return this._stash.promise(file.key);
			}
			// it is not solved and not in the active list so lets load it

			var d:Q.Deferred<tsd.DefVersion> = this._stash.defer(file.key);
			this.track.start(Resolver.resolve);

			var cleanup = () => {
				//remove solved promise
				this._stash.remove(file.key);
				this.track.event(Resolver.remove);
			};

			Q.all([
				this.core.index.getIndex(),
				this.core.content.loadContent(file)
			]).spread((index:tsd.DefIndex, file:tsd.DefVersion) => {
				this.track.event(Resolver.parse);

				//force empty for robustness
				file.dependencies.splice(0, file.dependencies.length);

				var queued:Q.Promise<tsd.DefVersion>[] = this.applyResolution(index, file, file.blob.content.toString(file.blob.encoding));

				//keep
				file.solved = true;

				if (queued.length > 0) {
					this.track.event(Resolver.subload);
					return Q.all(queued);
				}
				else {
					this.track.skip(Resolver.subload);
				}
				return null;
			}).then(() => {
				cleanup();
				d.resolve(file);
			}, (err) => {
				cleanup();
				d.reject(err);
			});

			return d.promise;
		}

		applyResolution(index:tsd.DefIndex, file:tsd.DefVersion, content:string):Q.Promise<tsd.DefVersion>[] {
			var refs:string[] = this.extractPaths(file, content);

			return refs.reduce((memo:any[], refPath:string) => {
				if (index.hasDef(refPath)) {
					//use .head (could use same commit but that would be version hell with interdependent definitions)
					var dep:tsd.Def = index.getDef(refPath);
					file.dependencies.push(dep);
					this.track.event(Resolver.dep_added, dep.path);

					//TODO decide if always to go with head or not
					//maybe it need some resolving itself?
					if (!dep.head.solved && !this._stash.has(dep.head.key)) {
						this.track.event(Resolver.dep_recurse, dep.path);
						//xm.log('recurse ' + dep.toString());

						//lets go deeper
						var p:Q.Promise<tsd.DefVersion> = this.resolveDeps(dep.head);
						memo.push(p);
					}
				}
				else {
					this.track.warning(Resolver.dep_missing);
					xm.log.warn('path reference not in index: ' + refPath);
					//TODO weird: could be removed file; add it? beh?
				}
				return memo;
			}, []);
		}

		extractPaths(file:tsd.DefVersion, content:string):string[] {
			//filter reasonable formed paths
			return tsd.DefUtil.extractReferenceTags(content).reduce((memo:string[], refPath:string):any[] => {
				//TODO harder def-test? why?
				refPath = refPath.replace(leadingExp, '');
				//same folder
				if (refPath.indexOf('/') < 0) {
					refPath = file.def.project + '/' + refPath;
				}
				if (tsd.Def.isDefPath(refPath) && memo.indexOf(refPath) < 0) {
					memo.push(refPath);
				}
				else {
					this.track.logger.warn('not a usable reference: ' + refPath);
				}
				return memo;
			}, []);
		}
	}
}
