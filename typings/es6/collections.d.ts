declare module 'es6-collections' {
	// taken from lib.d.ts
	export class Map<K, V> {
		constructor();

		clear(): void;

		delete(key: K): boolean;

		forEach(callbackfn: (value: V, index: K, map: Map<K, V>) => void, thisArg?: any): void;

		get(key: K): V;

		has(key: K): boolean;

		set(key: K, value: V): Map<K, V>;

		size: number;
	}

	export class Set<T> {
		constructor();

		add(value: T): Set<T>;

		clear(): void;

		delete(value: T): boolean;

		forEach(callbackfn: (value: T, index: T, set: Set<T>) => void, thisArg?: any): void;

		has(value: T): boolean;

		size: number;
	}
}

declare module 'weak-map' {
	class WeakMap<K, V> {
		constructor();

		clear(): void;

		delete(key: K): boolean;

		get(key: K): V;

		has(key: K): boolean;

		set(key: K, value: V): WeakMap<K, V>;
	}

	export = WeakMap;
}
