/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 module xm {
	export function eachElem(collection:any[], callback:(value:any, index:number, collection:any[]) => void, thisArg?:any = null) {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			if (callback.call(thisArg, collection[i], i, collection) === false) {
				return;
			}
		}
	}

	export function eachProp(collection:any, callback:(value:any, key:string, collection:Object) => void, thisArg?:any = null) {
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				if (callback.call(thisArg, collection[key], key, collection) === false) {
					return;
				}
			}
		}
	}

	export function reduceArray(collection:any[], memo:any, callback:(memo:any, value:any, index:number, collection:any[]) => void, thisArg?:any = null):any {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			memo = callback.call(thisArg, memo, collection[i], i, collection);
		}
		return memo;
	}

	export function reduceHash(collection:any, memo:any, callback:(memo:any, value:any, index:number, collection:Object) => void, thisArg?:any = null):any {
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				memo = callback.call(thisArg, memo, collection[key], key, collection);
			}
		}
		return memo;
	}

	export function mapArray(collection:any[], callback:(memo:any, value:any, index:number, collection:any[]) => void, thisArg?:any = null):any[] {
		var map:any[] = [];
		for (var i = 0, ii = collection.length; i < ii; i++) {
			map[i] = callback.call(thisArg, map[i], i, collection);
		}
		return map;
	}

	export function mapHash(collection:any, callback:(memo:any, value:any, index:number, collection:Object) => void, thisArg?:any = null):any {
		var map:any = {};
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				map[key] = callback.call(thisArg, collection[key], key, collection);
			}
		}
		return map;
	}
}

