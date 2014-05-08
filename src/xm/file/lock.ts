/// <reference path="../../_ref.d.ts" />

'use strict';

import Promise = require('bluebird');

import lock = require('lockfile');
export import Options = lock.Options;

export class Lockfile {

	opts: Options;

	constructor (opts?: Options) {
		this.opts = opts || {};

		Object.freeze(this.opts);
	}

	lock(path: string) {
		return new Promise<() => Promise<void>>((r, e) => {
			lock.lock(path, this.opts, (err) => {
				if (err) {
					e(err);
				}
				else {
					r(() => {
						return this.unlock(path);
					});
				}
			});
		});
	}

	unlock(path: string) {
		return new Promise<void>((r, e) => {
			lock.unlock(path, (err) => {
				if (err) {
					e(err);
				}
				else {
					r(null);
				}
			});
		});
	}

	check(path: string) {
		return new Promise<void>((r, e) => {
			lock.check(path, this.opts, (err) => {
				if (err) {
					e(err);
				}
				else {
					r(null);
				}
			});
		});
	}
}
