/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

module xm {
	'use strict';

	var hasProp = Object.prototype.hasOwnProperty;

	//TODO: generics for TS 0.9

	/*
	 IKeyValueMap: key-value map
	 */
	export interface IKeyValueMap<T> {
		has (key:string):boolean;
		get(key:string, alt?:T):T;
		set (key:string, value:T):void;
		remove (key:string):void;
		keys ():string[];
		values ():T[];
		import (data:{ [key: string]:T }):void;
		export ():{ [key: string]:T };
		clear ():void;
	}
	/*
	 KeyValueMap: yer basic string key-value map, safe from property interference
	 */
	export class KeyValueMap<T> implements IKeyValueMap<T> {

		//need proper type
		private _store:{ [key: string]:T } = {};

		constructor(data?:any) {
			if (data) {
				this.import(data);
			}
			Object.defineProperty(this, '_store', {enumerable: false, writable: false});
		}

		has(key:string):boolean {
			return hasProp.call(this._store, key);
		}

		get(key:string, alt:T = null):T {
			if (typeof key !== 'string') {
				//js usage
				throw new Error('key must be a string');
			}
			if (hasProp.call(this._store, key)) {
				return this._store[key];
			}
			return alt;
		}

		set(key:string, value:T):void {
			this._store[key] = value;
		}

		remove(key:string):void {
			if (hasProp.call(this._store, key)) {
				delete this._store[key];
			}
		}

		keys():string[] {
			var ret:string[] = [];
			for (var key in this._store) {
				if (hasProp.call(this._store, key)) {
					ret.push(key);
				}
			}
			return ret;
		}

		values():T[] {
			var ret:T[] = [];
			for (var key in this._store) {
				if (hasProp.call(this._store, key)) {
					ret.push(this._store[key]);
				}
			}
			return ret;
		}

		clear():void {
			for (var key in this._store) {
				if (hasProp.call(this._store, key)) {
					delete this._store[key];
				}
			}
		}

		import(data:{ [key:string]:any }):void {
			if (!data || typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') {
				return;
			}
			for (var key in data) {
				if (hasProp.call(data, key)) {
					this._store[key] = data[key];
				}
			}
		}

		export():{ [key:string]:T } {
			var ret:{ [key:string]:any } = {};
			for (var key in this._store) {
				if (hasProp.call(this._store, key)) {
					ret[key] = this._store[key];
				}
			}
			return ret;
		}
	}
}
