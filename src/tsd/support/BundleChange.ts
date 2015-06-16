/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');

import collection = require('../../xm/collection');
import Bundle = require('./Bundle');

class BundleChange {

	bundle: Bundle;

	private _added = new collection.Set<string>();
	private _removed = new collection.Set<string>();

	constructor(bundle: Bundle) {
		this.bundle = bundle;
	}

	add(target: string): void {
		if (!target) {
			return;
		}
		this._added.add(target);
		this._removed.delete(target);
	}

	remove(target: string): void {
		if (!target) {
			return;
		}
		this._added.delete(target);
		this._removed.add(target);
	}

	someRemoved(): boolean {
		return this._removed.size > 0;
	}

	someAdded(): boolean {
		return this._added.size > 0;
	}

	someChanged(): boolean {
		return this._added.size > 0 || this._removed.size > 0;
	}

	getRemoved(relative: boolean, canonical: boolean = false): string [] {
		var arr: string[] = this._removed.values();
		if (!relative) {
			arr = arr.map(p => path.resolve(this.bundle.baseDir, p));
		}
		else {
			arr = arr.map(p => path.relative(this.bundle.baseDir, p));
		}
		if (canonical) {
			return arr.map(p => p.replace(/\\/g, '/'));
		}
		return arr;
	}

	getAdded(relative: boolean, canonical: boolean = false): string [] {
		var arr: string[] = this._added.values();
		if (!relative) {
			arr = arr.map(p => path.resolve(this.bundle.baseDir, p));
		}
		else {
			arr = arr.map(p => path.relative(this.bundle.baseDir, p));
		}
		if (canonical) {
			return arr.map(p => p.replace(/\\/g, '/'));
		}
		return arr;
	}
}

export = BundleChange;
