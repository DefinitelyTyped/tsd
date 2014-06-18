/// <reference path="./_ref.d.ts" />

'use strict';

/* tslint:disable:forin */

export interface Dict<T> {
	[key: string]: T;
}

export function dict<T>(): Dict<T> {
	return Object.create(null);
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

export class Set<T> {

	private list: T[] = [];

	constructor(d?: T[]) {
		this.list = d || [];
	}

	has(value: T): boolean {
		return this.list.indexOf(value) > -1;
	}

	add(value: T): void {
		var i = this.list.indexOf(value);
		if (i < 0) {
			this.list.push(value);
		}
	}

	delete(value: T): void {
		var i = this.list.indexOf(value);
		if (i > -1) {
			this.list.splice(i, 1);
		}
	}

	values(): T[] {
		return this.list.slice(0);
	}

	forEach(iterator: (value: T, index: number) => void): void {
		var arr = this.list.slice(0);
		for (var i = 0, ii = arr.length; i < ii; i++) {
			iterator(arr[i], i);
		}
	}

	get size(): number {
		return this.list.length;
	}
}

export class Hash<T> {
	private dict: Dict<T>;

	constructor(d?: Dict<T>) {
		this.dict = dict<T>();
		if (d) {
			Object.keys(d).forEach((key) => {
				this.dict[key] = d[key];
			});
		}
	}

	has(key: string): boolean {
		return key in this.dict;
	}

	get(key: string): T {
		if (key in this.dict) {
			return this.dict[key];
		}
		return null;
	}

	set(key: string, value: T): void {
		this.dict[key] = value;
	}

	delete(key: string): void {
		delete this.dict[key];
	}

	clear(): void {
		this.dict = dict<T>();
	}

	merge(d: Dict<T>): void {
		for (var key in d) {
			this.dict[key] = d[key];
		}
	}

	keys(): string[] {
		var keys: string[] = [];
		for (var key in this.dict) {
			keys.push(key);
		}
		return keys;
	}

	values(): T[] {
		var values: T[] = [];
		for (var key in this.dict) {
			values.push(this.dict[key]);
		}
		return values;
	}

	forEach(iterator: (value: T, key: string) => void): void {
		var arr = this.keys();
		for (var i = 0, ii = arr.length; i < ii; i++) {
			var key = arr[i];
			iterator(this.dict[key], key);
		}
	}

	get size(): number {
		var size: number = 0;
		for (var key in this.dict) {
			size++;
		}
		return size;
	}
}

// use with TypeScript enums
export function enumNames(enumer: Object): string[] {
	return Object.keys(enumer).filter((value: string) => {
		return !/\d+/.test(value);
	});
}
