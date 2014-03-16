/// <reference path="../_ref.d.ts" />

// TODO add interesting helpers based on weak-map

import Promise = require('bluebird');

export class PromiseHandle<T> {

	promise: Promise<T>;
	defer: Promise.Resolver<T>;

	constructor(defer?: Promise.Resolver<T>, promise?: Promise<T>) {
		this.defer = defer;
		this.promise = (defer ? defer.promise : promise);
	}
}

export class PromiseStash<T> {

	private _stash = new Map<string, Promise.Resolver<T>>();

	constructor() {
	}

	/*getHandle(key:string, fresh?:string):PromiseHandle<T> {
	 if (fresh) {
	 this.remove(key);
	 }
	 else if (this.has(key)) {
	 return new PromiseHandle<T>(null, this.promise(key));
	 }
	 return new PromiseHandle<T>(this.defer(key));
	 }*/

	has(key: string): boolean {
		return this._stash.has(key);
	}

	defer(key: string): Promise.Resolver<T> {
		if (this._stash.has(key)) {
			return null;
		}
		var d = Promise.defer<T>();
		this._stash.set(key, d);
		return d;
	}

	promise(key: string): Promise<T> {
		if (this._stash.has(key)) {
			return this._stash.get(key).promise;
		}
		return null;
	}

	remove(key: string): void {
		this._stash.delete(key);
	}
}
