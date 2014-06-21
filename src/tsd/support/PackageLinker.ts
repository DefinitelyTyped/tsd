/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');

import Promise = require('bluebird');
import VError = require('verror');

import FS = require('../../xm/fileIO');
import typeOf = require('../../xm/typeOf');

import PackageDefinition = require('../support/PackageDefinition');

class PackageType {

	name: string;
	folderName: string;
	infoJson: string;

	constructor(name: string, folderName: string, infoJson: string) {
		this.name = name;
		this.folderName = folderName;
		this.infoJson = infoJson;
	}
}

function getStringArray(elem: any): string[] {
	if (!typeOf.isArray(elem)) {
		if (typeOf.isString(elem)) {
			return [elem];
		}
		return [];
	}
	return (<string[]>elem).filter(typeOf.isString);
}

class PackageLinker {

	private baseDir: string;
	private managers: PackageType[] = [];

	constructor() {

		this.managers.push(new PackageType('node', 'node_modules', 'package.json'));
		this.managers.push(new PackageType('bower', 'bower_modules', 'bower.json'));
	}

	scanDefinitions(baseDir: string): Promise<PackageDefinition[]> {
		var memo: PackageDefinition[] = [];

		return Promise.all(this.managers.map((type: PackageType) => {
			return this.scanFolder(memo, type, baseDir);
		})).return(memo);
	}

	private scanFolder(memo: PackageDefinition[], type: PackageType, baseDir: string): Promise<void> {
		var scanDir = path.resolve(baseDir, type.folderName);
		var pattern = '*/' + type.infoJson;

		return FS.glob(pattern, {
			cwd: scanDir
		}).map((infoPath: string) => {
			var packageName = path.basename(path.dirname(infoPath));
			infoPath = path.join(scanDir, infoPath);

			return FS.readJSON(infoPath).then((info) => {
				var use = new PackageDefinition(packageName, [], type.name);
				// verify existence
				return Promise.all(PackageLinker.extractDefLinks(info).map((ref) => {
					ref = path.resolve(path.dirname(infoPath), ref);
					return FS.exists(ref).then((exists) => {
						if (exists) {
							use.definitions.push(ref);
						}
					});
				})).then(() => {
					if (use.definitions.length > 0) {
						memo.push(use);
					}
				});
			}).return();
		}).catch((err) => {
			// eat error
		});
	}

	static extractDefLinks(object: any): string[] {
		var ret: string[] = [];
		if (!typeOf.isObject(object)) {
			return ret;
		}
		if (!typeOf.hasOwnProp(object, 'typescript')) {
			return ret;
		}
		var ts = object.typescript;
		if (!typeOf.isObject(ts)) {
			return ret;
		}
		// want?
		if (typeOf.hasOwnProp(ts, 'definition')) {
			return getStringArray(ts.definition);
		}
		if (typeOf.hasOwnProp(ts, 'definitions')) {
			return getStringArray(ts.definitions);
		}
		return ret;
	}
}

export = PackageLinker;
