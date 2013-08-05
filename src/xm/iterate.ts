module xm {
	export function eachElem(collection:any[], callback:(value:any, index:number, collection:any[]) => void, thisArg?:Object) {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			if (callback.call(thisArg, collection[i], i, collection) === false) {
				return;
			}
		}
	}

	export function eachProp(collection:any, callback:(value:any, key:string, collection:Object) => void, thisArg?:Object) {
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				if (callback.call(thisArg, collection[key], key, collection) === false) {
					return;
				}
			}
		}
	}

	export function reduceArray(collection:any[], memo:any, callback:(memo:any, value:any, index:number, collection:any[]) => void, thisArg?:Object):any {
		for (var i = 0, ii = collection.length; i < ii; i++) {
			memo = callback.call(thisArg, memo, collection[i], i, collection);
		}
		return memo;
	}

	export function reduceHash(collection:any, memo:any, callback:(memo:any, value:any, index:number, collection:Object) => void, thisArg?:Object):any {
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				memo = callback.call(thisArg, memo, collection[key], key, collection);
			}
		}
		return memo;
	}

	export function mapArray(collection:any[], callback:(memo:any, value:any, index:number, collection:any[]) => void, thisArg?:Object):any[] {
		var map:any[] = [];
		for (var i = 0, ii = collection.length; i < ii; i++) {
			map[i] = callback.call(thisArg, map[i], i, collection);
		}
		return map;
	}

	export function mapHash(collection:any, callback:(memo:any, value:any, index:number, collection:Object) => void, thisArg?:Object):any {
		var map:any = {};
		for (var key in collection) {
			if (collection.hasOwnProperty(key)) {
				map[key] = callback.call(thisArg, collection[key], key, collection);
			}
		}
		return map;
	}
}

