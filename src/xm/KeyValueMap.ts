/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';

	var hasOwnProp:(obj:any, v:string) => bool = Object.prototype.hasOwnProperty.call;

	//TODO: generics for TS 0.9

	/*
	 IKeyValueMap: key-value map
	 */
	export interface IKeyValueMap {
		has (key:string):bool;
		get(key:string, alt?:any):any;
		set (key:string, value:any);
		remove (key:string);
		keys ():string[];
		//TODO ditch/reconsider values()'s allow[]
		values ():any[];
		import (data:any):void;
		//TODO ditch/reconsider export()'s keys[]
		export ():any;
		clear ();
	}
	/*
	 KeyValueMap: yer basic string key-value map, safe from property interference
	 */
	export class KeyValueMap implements IKeyValueMap {

		//need proper type
		private _store = {};

		constructor(data?:any) {
			if (data) {
				this.import(data);
			}
			Object.defineProperty(this, '_store', {enumerable: false});
		}

		has(key:string):bool {
			key = '' + key;
			return hasOwnProp(this._store, key);
		}

		get(key:string, alt?:any = null):any {
			key = '' + key;
			if (hasOwnProp(this._store, key)) {
				return this._store[key];
			}
			return alt;
		}

		set(key:string, value:any) {
			key = '' + key;
			this._store[key] = value;
		}

		remove(key:string) {
			key = '' + key;
			if (hasOwnProp(this._store, key)) {
				delete this._store[key];
			}
		}

		keys():string[] {
			//chop prefix
			var ret:string[] = [];
			for (var key in this._store) {
				if (hasOwnProp(this._store, key)) {
					ret.push(key);
				}
			}
			return ret;
		}

		values():any[] {
			var ret = [];
			for (var key in this._store) {
				if (hasOwnProp(this._store, key)) {
					ret.push(this._store[key]);
				}
			}
			return ret;
		}

		clear() {
			for (var key in this._store) {
				if (hasOwnProp(this._store, key)) {
					delete this._store[key];
				}
			}
		}

		import(data:any, allow?) {
			if (typeof data !== 'object') {
				return;
			}
			for (var key in data) {
				if (hasOwnProp(data, key)) {
					this._store[key] = data[key];
				}
			}
		}

		export(allow?:string[]):any {
			var ret:any = {};
			for (var key in this._store) {
				if (hasOwnProp(this._store, key)) {
					ret[key] = this._store[key];
				}
			}
			return ret;
		}
	}
}
