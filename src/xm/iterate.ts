/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="typeOf.ts" />

module xm {
	'use strict';

	// TODO decide what to do with this file: seems modern JS + TypeScript 0.9 is good enough with arrays? only keep Object iterators?
	// TODO add generics
	// TODO add support for Iterators etc

	/* tslint:disable:max-line-length */
	/*
	 various simple helpers to iterate stuff, saves including underscore for every use-case
	 */
	export function eachElem(collection:any[], callback:(value:any, index:number, collection:any[]) => void, thisArg:any = null) {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			if (callback.call(thisArg, collection[i], i, collection) === false) {
				return;
			}
		}
	}

	export function eachProp(collection:any, callback:(value:any, prop:string, collection:Object) => void, thisArg:any = null) {
		for (var prop in collection) {
			if (xm.hasOwnProp(collection, prop)) {
				if (callback.call(thisArg, collection[prop], prop, collection) === false) {
					return;
				}
			}
		}
	}

	export function reduceArray(collection:any[], memo:any, callback:(memo:any, value:any, index:number, collection:any[]) => void, thisArg:any = null):any {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			memo = callback.call(thisArg, memo, collection[i], i, collection);
		}
		return memo;
	}

	export function reduceHash(collection:any, memo:any, callback:(memo:any, value:any, prop:string, collection:Object) => void, thisArg:any = null):any {
		for (var prop in collection) {
			if (xm.hasOwnProp(collection, prop)) {
				memo = callback.call(thisArg, memo, collection[prop], prop, collection);
			}
		}
		return memo;
	}

	export function mapArray(collection:any[], callback:(value:any, index:number, collection:any[]) => void, thisArg:any = null):any[] {
		var map:any[] = [];
		for (var i = 0, ii = collection.length; i < ii; i++) {
			map[i] = callback.call(thisArg, collection[i], i, collection);
		}
		return map;
	}

	export function mapHash(collection:any, callback:(value:any, prop:string, collection:Object) => void, thisArg:any = null):any {
		var map:any = {};
		for (var prop in collection) {
			if (xm.hasOwnProp(collection, prop)) {
				map[prop] = callback.call(thisArg, collection[prop], prop, collection);
			}
		}
		return map;
	}

	export function filterArray(collection:any[], callback:(value:any, index:number, collection:any[]) => boolean, thisArg:any = null):any[] {
		var map:any[] = [];
		for (var i = 0, ii = collection.length; i < ii; i++) {
			if (callback.call(thisArg, collection[i], i, collection)) {
				map.push(collection[i]);
			}
		}
		return map;
	}

	export function filterHash(collection:any, callback:(value:any, prop:string, collection:Object) => boolean, thisArg:any = null):any {
		var res:any = {};
		for (var prop in collection) {
			if (xm.hasOwnProp(collection, prop) && callback.call(thisArg, collection[prop], prop, collection)) {
				res[prop] = collection[prop];
			}
		}
		return res;
	}
	/* tslint:enable:max-line-length */
}
