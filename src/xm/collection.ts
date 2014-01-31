/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="typeOf.ts" />
/// <reference path="../../typings/fixes.d.ts" />

module xm {
	'use strict';
	// TODO consider expanding to work on every collection type

	export function keysOf<K, V>(map:Map<K, V>):K[] {
		return toArray<K>(map.keys());
	}

	export function valuesOf<K, V>(map:Map<K, V>):V[] {
		return toArray<V>(map.values());
	}

	export function toArray<T>(iterator:ArrayIterator<T>):T[] {
		var result = iterator.next();
		var ret:T[] = [];
		while (!result.done) {
			ret.push(result.value);
			result = iterator.next();
		}
		return ret;
	}
}
