/// <reference path="../_ref.d.ts" />

import Promise = require('bluebird');

class ActionMap<T> {

	private _map = new Map<string, T>();

	constructor(data?: any) {
		if (data) {
			Object.keys(data).forEach((key: string, value: any) => {
				this._map.set(key, value);
			});
		}
	}

	set(key: string, value: T) {
		return this._map.set(key, value);
	}

	has(key: string): Boolean {
		return this._map.has(key);
	}

	get(key: string): T {
		return this._map.get(key);
	}

	run<U>(id: string, call: (value: T) => U, optional: boolean = false): Promise<U> {
		return Promise.attempt<U>(() => {
			if (this._map.has(id)) {
				// cast as any
				return call(this._map.get(id));
			}
			if (!optional) {
				throw new Error('missing action: ' + id);
			}
			return null;
		});
	}

	runSerial<U>(queue: string[], call: (value: T) => U, optional: boolean = false): Promise<U[]> {
		return Promise.map(queue, (id: string) => {
			return this.run(id, call, optional);
		});
	}
}

export = ActionMap;
