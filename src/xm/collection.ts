/// <reference path="./_ref.d.ts" />

// TODO consider expanding to work on every collection type
// TODO ditch for Lazy.js or Highland

export function keysOf<K, V>(map: Map<K, V>): K[] {
	var ret: K[] = [];
	map.forEach((v, k) => {
		ret.push(k);
	});
	return ret;
}

export function valuesOf<K, V>(map: Map<K, V>): V[] {
	var ret: V[] = [];
	map.forEach((v) => {
		ret.push(v);
	});
	return ret;
}

export function toArray<T>(iterator: ArrayIterator<T>): T[] {
	var result = iterator.next();
	var ret: T[] = [];
	while (!result.done) {
		ret.push(result.value);
		result = iterator.next();
	}
	return ret;
}

export function enumNames(enumer: Object): string[] {
	return Object.keys(enumer).filter((value: string) => {
		return !/\d+/.test(value);
	});
}
