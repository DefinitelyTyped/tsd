///<reference path="Core.ts" />
///<reference path="../api_ren.ts" />
///<reference path="../data/DefUtil.ts" />
///<reference path="../data/Def.ts" />
///<reference path="../data/DefVersion.ts" />

module tsd {

	var Q:QStatic = require('q');
	var leadingExp = /^\.\.\//;

	/*
	 Resolver: resolve dependencies for given def versions
	 */
	//TODO add unit test,  verify race condition solver works properly
	export class Resolver {

		private _core:Core;
		private _active:xm.KeyValueMap = new xm.KeyValueMap();

		stats:xm.StatCounter = new xm.StatCounter();

		constructor(core:Core) {
			xm.assertVar('core', core, Core);
			this._core = core;

			this.stats.log = this._core.context.verbose;
		}

		resolveBulk(list:tsd.DefVersion[]):Qpromise {

			list = tsd.DefUtil.uniqueDefVersion(list);

			return Q.all(list.map((file:tsd.DefVersion) => {
				return this.resolve(file);
			})).thenResolve(list);
		}

		resolve(file:tsd.DefVersion):Qpromise {
			// easy bail
			if (file.solved) {
				this.stats.count('solved-early');
				return Q(file);
			}

			//handle race conditions
			if (this._active.has(file.key)) {
				this.stats.count('active-has');
				//return running promise
				return this._active.get(file.key);
			}
			else {
				this.stats.count('active-miss');
			}
			// it is not solved and not in the active list so lets load it

			//keep the promise for storage
			var promise:Qpromise = this._core.loadContent(file).then((file:tsd.DefVersion):Qpromise => {
				this.stats.count('file-parse');

				//force empty for robustness
				file.dependencies = [];

				var refs:string[] = tsd.DefUtil.extractReferenceTags(file.content);

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
						xm.log.warn('not a reference: ' + refPath);
					}
					return memo;
				}, []);

				//story to solve and collect promises for unsolved references
				var queued = <Qpromise[]>refs.reduce((memo:any[], refPath) => {
					if (this._core.index.hasDef(refPath)) {
						//use .head (could use same commit but that would be version hell with interdependent definitions)
						var dep:DefVersion = this._core.index.getDef(refPath).head;
						file.dependencies.push(dep);
						this.stats.count('dep-added');

						//maybe it need some resolving itself?
						if (!dep.solved && !this._active.has(dep.key)) {
							this.stats.count('dep-recurse');
							//xm.log('recurse ' + dep.toString());

							//lets go deeper
							memo.push(this.resolve(dep));
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

				//remove solved promise
				this._active.remove(file.key);
				this.stats.count('active-remove');

				if (queued.length > 0) {
					this.stats.count('subload-start');
					return Q.all(queued);
				}
				return Q(file);

			}).thenResolve(file);

			//store promise while it is running
			this.stats.count('active-set');
			this._active.set(file.key, promise);

			return promise;
		}
	}
}