/// <reference path="../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');
import collection = require('../collection');

class ActionMap<T> extends collection.Hash<T> {

	constructor(data?: collection.Dict<T>) {
		super(data);
	}

	run<U>(id: string, call: (value: T) => U, optional: boolean = false): Promise<U> {
		return Promise.attempt<U>(() => {
			if (this.has(id)) {
				// cast as any
				return call(this.get(id));
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
