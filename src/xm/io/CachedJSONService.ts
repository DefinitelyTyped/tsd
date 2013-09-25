///<reference path="../../_ref.d.ts" />
///<reference path="CachedLoader.ts" />
///<reference path="CachedJSONStore.ts" />

module xm {
	'use strict';

	var Q:QStatic = require('q');
	var fs = require('fs');
	var path = require('path');
	var FS:Qfs = require('q-io/fs');
	/*
	 CachedJSONService: a simple JSON implementation of CachedLoaderService using CachedJSONStore
	 */
	//TODO add gzip compression?
	export class CachedJSONService implements xm.CachedLoaderService {

		private _store:xm.CachedJSONStore;

		constructor(dir:string) {
			xm.assertVar('dir', dir, 'string');
			this._store = new xm.CachedJSONStore(dir);

			xm.ObjectUtil.hidePrefixed(this);
		}

		getCachedRaw(key:string):Qpromise {
			return this._store.getValue(key);
		}

		getValue(key:string, opts?):Qpromise {
			return this._store.getValue(key).then((res:xm.CachedJSONValue) => {
				if (res) {
					return res.value;
				}
				return null;
			});
		}

		writeValue(key:string, label:string, value:any, opts?):Qpromise {
			var cached = new xm.CachedJSONValue(label, key);
			cached.setValue(value);
			return this._store.storeValue(cached).then((info) => {
				return value;
			});
		}

		getKeys(opts?):Qpromise {
			return Q([]);
		}

		get store():xm.CachedJSONStore {
			return this._store;
		}
	}
}
