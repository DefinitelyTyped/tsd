/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');

import assertVar = require('../assertVar');
import fileIO = require('../fileIO');
import objectUtils = require('../objectUtils');

// partial from pkginfo
function findInfo(pmodule: NodeModule, dir?: string): string {
	if (!dir) {
		dir = path.dirname(pmodule.filename);
	}

	var file = path.join(dir, 'package.json');
	if (fs.existsSync(file)) {
		return file;
	}

	if (dir === '/') {
		throw new Error('Could not find package.json up from: ' + dir);
	}
	else if (!dir || dir === '.') {
		throw new Error('Cannot find package.json from unspecified directory');
	}
	// one-up
	return findInfo(pmodule, path.dirname(dir));
}

/*
 PackageJSON: wrap a package.json
 */
// TODO add typed json-pointers? (low prio)
// TODO add validation with the json schema
// TODO extract io to promise based module
class PackageJSON {

	private _pkg: any;

	private static _localPath: string;
	private static _local: PackageJSON;

	constructor(pkg: any, public path: string = null) {
		assertVar(pkg, 'object', 'pkg');
		this._pkg = pkg;
	}

	get raw(): any {
		return this._pkg;
	}

	get name(): string {
		return this._pkg.name || null;
	}

	get description(): string {
		return this._pkg.description || '';
	}

	get version(): string {
		return this._pkg.version || '0.0.0';
	}

	getNameVersion(): string {
		return this.name + ' ' + this.version;
	}

	// append version?
	getKey(): string {
		return this.name + '-' + this.version;
	}

	getHomepage(short: boolean = false): string {
		var homepage: string = this._pkg.homepage;
		if (homepage) {
			if (short) {
				return homepage.replace(/(^https?:\/\/)|(\/?$)/g, '');
			}
			return homepage;
		}
		if (short) {
			return '<no homepage>';
		}
		return '';
	}

	static find(): string {
		if (!PackageJSON._localPath) {
			PackageJSON._localPath = findInfo((module));
		}
		return PackageJSON._localPath;
	}

	static getLocal(): PackageJSON {
		if (!PackageJSON._local) {
			var src = PackageJSON.find();
			if (!src) {
				throw (new Error('cannot find local package.json'));
			}
			PackageJSON._local = new PackageJSON(fileIO.readJSONSync(src), src);
		}
		return PackageJSON._local;
	}
}

export = PackageJSON;
