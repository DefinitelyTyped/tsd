///<reference path="../Core.ts" />
///<reference path="../API.ts" />
///<reference path="../data/DefUtil.ts" />
///<reference path="../data/Def.ts" />
///<reference path="../data/DefVersion.ts" />

module tsd {
	'use strict';

	var Q:typeof Q = require('q');

	var leadingExp = /^\.\.\//;

	/*
	 Resolver: resolve dependencies for given def versions
	 */
	//TODO add unit test,  verify race condition solver works properly
	//TODO 'resolve' not good choice (conflicts with promises)
	export class Resolver {

		private _core:Core;
		private _active:xm.KeyValueMap<Q.Promise<DefVersion>> = new xm.KeyValueMap();

		stats:xm.StatCounter = new xm.StatCounter();

		constructor(core:Core) {
			xm.assertVar('core', core, Core);
			this._core = core;

			this.stats.log = this._core.context.verbose;
			this.stats.logger = xm.getLogger('Resolver');

			xm.ObjectUtil.hidePrefixed(this);
		}

		resolveBulk(list:tsd.DefVersion[]):Q.Promise<DefVersion[]> {
			var d:Q.Deferred<DefVersion[]> = Q.defer();
			this.stats.count('solve-bulk-start');

			list = tsd.DefUtil.uniqueDefVersion(list);

			Q.all(list.map((file:tsd.DefVersion) => {
				return this.resolveDeps(file);
			})).then(() => {
				this.stats.count('solve-bulk-success');
				d.resolve(list);
			}, (err) => {
				this.stats.count('solve-bulk-error');
				d.reject(err);
			});

			return d.promise;
		}

		resolveDeps(file:tsd.DefVersion):Q.Promise<DefVersion> {
			var d:Q.Deferred<DefVersion> = Q.defer();

			// easy bail
			//TODO verifiy some more (file.dependencies.length etc)
			if (file.solved) {
				this.stats.count('solved-already');
				d.resolve(file);
				return d.promise;
			}

			//handle race conditions
			if (this._active.has(file.key)) {
				this.stats.count('active-has');
				//return running promise
				this._active.get(file.key).done(() => {
					d.resolve(file);
				}, d.reject);
				return d.promise;
			}
			else {
				this.stats.count('active-miss');
			}
			// it is not solved and not in the active list so lets load it

			var cleanup = () => {
				//remove solved promise
				xm.log.debug('cleanup!');
				this._active.remove(file.key);
				this.stats.count('active-remove');
			};

			//keep the promise for storage
			//TODO refactor this for readability
			this._core.loadContent(file).then((file:tsd.DefVersion) => {
				this.stats.count('file-parse');

				//force empty for robustness
				file.dependencies.splice(0, file.dependencies.length);

				var refs:string[] = tsd.DefUtil.extractReferenceTags(file.blob.content.toString('utf8'));

				//filter reasonable formed paths
				refs = <string[]>refs.reduce((memo:any[], refPath:string):any[] => {
					//TODO harder def-test? why?
					refPath = refPath.replace(leadingExp, '');
					//same folder
					if (refPath.indexOf('/') < 0) {
						refPath = file.def.project + '/' + refPath;
					}
					if (tsd.Def.isDefPath(refPath)) {
						memo.push(refPath);
					}
					else {
						xm.log.warn('not a usable reference: ' + refPath);
					}
					return memo;
				}, []);

				//store to solve and collect promises for unsolved references
				var queued:Q.Promise<DefVersion>[] = refs.reduce((memo:any[], refPath:string) => {
					if (this._core.index.hasDef(refPath)) {
						//use .head (could use same commit but that would be version hell with interdependent definitions)
						var dep:Def = this._core.index.getDef(refPath);
						file.dependencies.push(dep);
						this.stats.count('dep-added');

						//TODO decide if always to go with head or not
						//maybe it need some resolving itself?
						if (!dep.head.solved && !this._active.has(dep.head.key)) {
							this.stats.count('dep-recurse');
							//xm.log('recurse ' + dep.toString());

							//lets go deeper
							memo.push(this.resolveDeps(dep.head));
						}
					}
					else {
						xm.log.warn('path reference not in index: ' + refPath);
						//TODO weird: could be removed a file; add it? beh?
					}
					return memo;
				}, []);

				//keep
				file.solved = true;

				if (queued.length > 0) {
					this.stats.count('subload-start');
					return Q.all(queued);
				}
				else {
					this.stats.count('subload-none');
				}
			}).then(() => {
				cleanup();
				d.resolve(file);
			}, (err) => {
				cleanup();
				d.reject(err);
			});

			//store promise while it is running
			this.stats.count('active-set');
			this._active.set(file.key, d.promise);

			return d.promise;
		}
	}
}
