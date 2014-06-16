/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');

import Bundle = require('./Bundle');

class BundleChange {

	bundle: Bundle;

	private _added: string[] = [];
	private _removed: string[] = [];

	constructor(bundle: Bundle) {
		this.bundle = bundle;
	}

	add(target: string): void {
		if (!target) {
			return;
		}
		if (this._added.indexOf(target)) {
			this._added.push(target);
		}
		var i = this._removed.indexOf(target);
		if (i > -1) {
			this._removed.splice(i, 1);
		}
	}

	remove(target: string): void {
		if (!target) {
			return;
		}
		if (this._removed.indexOf(target)) {
			this._removed.push(target);
		}
		var i = this._added.indexOf(target);
		if (i > -1) {
			this._added.splice(i, 1);
		}
	}

	someRemoved(): boolean {
		return this._removed.length > 0;
	}

	someAdded(): boolean {
		return this._added.length > 0;
	}

	someChanged(): boolean {
		return this._added.length > 0 || this._removed.length > 0;
	}

	getRemoved(relative: boolean, canonical: boolean = false): string [] {
		var arr: string[];
		if (!relative) {
			arr = this._removed.map(p => path.resolve(this.bundle.baseDir, p));
		}
		else {
			arr = this._removed.map(p => path.relative(this.bundle.baseDir, p));
		}
		if (canonical) {
			return arr.map(p => p.replace(/\\/g, '/'));
		}
		return arr;
	}

	getAdded(relative: boolean, canonical: boolean = false): string [] {
		var arr: string[];
		if (!relative) {
			arr = this._added.map(p => path.resolve(this.bundle.baseDir, p));
		}
		else {
			arr = this._added.map(p => path.relative(this.bundle.baseDir, p));
		}
		if (canonical) {
			return arr.map(p => p.replace(/\\/g, '/'));
		}
		return arr;
	}
}

export = BundleChange;
