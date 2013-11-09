///<reference path="../_ref.d.ts" />
///<reference path="KeyValueMap.ts" />
///<reference path="assertVar.ts" />

module xm {

	var Q = require('q');

	export class PromiseHandle<T> {

		promise:Q.Promise<T>;
		defer:Q.Deferred<T>;

		constructor(defer?:Q.Deferred<T>, promise?:Q.Promise<T>) {
			this.defer = defer;
			this.promise = (defer ? defer.promise : promise);
		}

	}

	export class PromiseStash<T> {

		private _stash:xm.KeyValueMap<Q.Deferred<T>> = new xm.KeyValueMap();

		constructor() {
		}

		/*getHandle(key:string, fresh?:string):xm.PromiseHandle<T> {
			if (fresh) {
				this.remove(key);
			}
			else if (this.has(key)) {
				return new xm.PromiseHandle<T>(null, this.promise(key));
			}
			return new xm.PromiseHandle<T>(this.defer(key));
		}*/

		has(key:string):boolean {
			return this._stash.has(key);
		}

		promise(key:string):Q.Promise<T> {
			if (this._stash.has(key)) {
				return this._stash.get(key).promise;
			}
			return null;
		}

		defer(key:string):Q.Deferred<T> {
			if (this._stash.has(key)) {
				return null;
			}
			var d:Q.Deferred<T> = Q.defer<T>();
			this._stash.set(key, d);
			return d;
		}

		remove(key:string):void {
			return this._stash.remove(key);
		}
	}
}
