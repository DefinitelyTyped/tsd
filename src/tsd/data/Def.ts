/// <reference path="../_ref.d.ts" />

'use strict';

import semver = require('semver');
import VError = require('verror');

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');

import DefVersion = require('./DefVersion');

var defExp = /^[a-z](?:[\._-]?[a-z0-9])*(?:\/[a-z](?:[\._-]?[a-z0-9])*)+\.d\.ts$/i;

var versionEnd = /(?:-v?)(\d+(?:\.\d+)*)(-[a-z](?:[_-]?[a-z0-9])*(?:\.\d+)*)?$/i;
var twoNums = /^\d+\.\d+$/;

var lockProps = [
	'path',
	'project',
	'name',
	'semver',
	'label',
	'isLegacy',
	'isMain',
];

/*
 Def: single definition in repo (identified by its path)
 */
class Def {

	// unique identifier: 'project/name-v0.1.3-alpha.d.ts'
	path: string = null;

	// split
	project: string = null;
	name: string = null;
	semver: string = null;

	// normalised display name
	label: string = null;

	isLegacy: boolean = false;
	isMain: boolean = true;

	// version from the DefIndex commit +tree (may be not our edit)
	head: DefVersion = null;

	// versions from commits that changed this file
	history: DefVersion[] = [];

	constructor(path: string) {
		assertVar(path, 'string', 'path');

		if (!defExp.test(path)) {
			throw new VError('cannot part path %s to Def', path);
		}

		this.path = path;

		var parts = this.path.replace(/\.d\.ts$/, '').split(/\//g);

		this.project = parts[0];
		this.name = parts.slice(1).join(':');

		// aa/bb.dts vs aa/bb/cc.d.ts
		this.isMain = (parts.length === 2);
		this.isLegacy = false;

		if (parts.length > 2 && parts[1] === 'legacy') {
			this.isLegacy = true;
			this.name = parts.slice(2).join(':');
			this.isMain = (parts.length === 3);
		}

		versionEnd.lastIndex = 0;
		var semMatch = versionEnd.exec(this.name);
		if (semMatch) {
			var sem = semMatch[1];

			// try to fix semver version
			if (twoNums.test(sem)) {
				sem += '.0';
			}
			if (semMatch.length > 2 && typeof semMatch[2] !== 'undefined') {
				sem += semMatch[2];
			}

			var valid = semver.valid(sem, true);
			if (valid) {
				this.semver = valid;
				this.name = this.name.substr(0, semMatch.index);
			}
			else {
				// console.log('invalid semver ' + def.name);
			}
		}

		this.label = this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');

		objectUtils.lockProps(this, lockProps);
	}

	toString(): string {
		return this.path;
	}

	// TODO add test
	get pathTerm(): string {
		return this.path.replace(/\.d\.ts$/, '');
	}

	static isDefPath(path: string): boolean {
		return defExp.test(path);
	}

	static getFrom(path: string): Def {
		if (!defExp.test(path)) {
			return null;
		}
		return new Def(path);
	}
}

export = Def;
