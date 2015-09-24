/// <reference path="../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import util = require('util');
import VError = require('verror');
import Joi = require('joi');

import typeOf = require('../../xm/typeOf');
import assert = require('../../xm/assert');
import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import collection = require('../../xm/collection');

import JSONStabilizer = require('../../xm/lib/JSONStabilizer');

import GithubRepoConfig = require('../../git/GithubRepoConfig');

import Const = require('../context/Const');
import InstalledDef = require('../context/InstalledDef');

import DefVersion = require('../data/DefVersion');
import DefCommit = require('../data/DefCommit');
import Def = require('../data/Def');

import tsdSchema = require('../schema/config');

/*
 Config: local config file
 */
// TODO decide, this is annooying.. how to keep data?
//  - as simple object straight from JSON?
//  - or parse and typed into and object?
//  - maybe worth to keep class (json is an important part of whole UIX after all)
//  - quite a lot of code needed for nice output (JSONStabilizer etc)

class Config implements GithubRepoConfig {

	path: string;
	version: string;
	repo: string;
	githubHost: string;
	ref: string;
	stats: boolean;
	bundle: string;
	// Save all properties
	otherFields: any;

	private _installed = new collection.Hash<InstalledDef>();

	private _stable: JSONStabilizer = new JSONStabilizer();

	constructor() {
		// import defaults
		this.reset();
	}

	reset(): void {
		// import defaults
		this.path = Const.typingsDir;
		this.version = Const.configVersion;
		this.repo = Const.definitelyRepo;
		this.githubHost = Const.githubHost;
		this.ref = Const.mainBranch;
		this.stats = Const.statsDefault;
		this.otherFields = {};

		// use linux seperator
		this.bundle = Const.typingsDir + '/' + Const.bundleFile;

		this._installed.clear();
	}

	resolveTypingsPath(baseDir: string): string {
		var cfgFull = path.resolve(baseDir);
		var typings = this.path.replace(/[\\\/]/g, path.sep);

		if (/^([\\\/]|\w:)/.test(this.path)) {
			// absolute path
			return typings;
		}
		// relative
		return path.resolve(cfgFull, typings);
	}

	get repoOwner(): string {
		return this.repo.split('/')[0];
	}

	get repoProject(): string {
		return this.repo.split('/')[1];
	}

	get repoRef(): string {
		return this.repo + '#' + this.ref;
	}

	addFile(file: DefVersion) {
		assertVar(file, DefVersion, 'file');

		var def: InstalledDef;
		if (this._installed.has(file.def.path)) {
			def = this._installed.get(file.def.path);
		}
		else {
			def = new InstalledDef(file.def.path);
		}
		def.update(file);

		this._installed.set(file.def.path, def);
	}

	hasFile(filePath: string): boolean {
		assertVar(filePath, 'string', 'filePath');
		return this._installed.has(filePath);
	}

	getFile(filePath: string): InstalledDef {
		assertVar(filePath, 'string', 'filePath');
		return this._installed.get(filePath);
	}

	removeFile(filePath: string) {
		assertVar(filePath, 'string', 'filePath');
		this._installed.delete(filePath);
	}

	getInstalled(): InstalledDef[] {
		return this._installed.values();
	}

	getInstalledPaths(): string[] {
		return this._installed.values().map((value: InstalledDef) => {
			return value.path;
		});
	}

	getInstalledAsDefVersionList(): DefVersion[] {
		var defs: DefVersion[] = [];
		this.getInstalled().forEach((installed) => {
			defs.push(new DefVersion(new Def(installed.path), new DefCommit(installed.commitSha)));
		});
		return defs;
	}

	toJSON(): any {
		var json = this.otherFields;
		json.version = this.version;
		json.repo = this.repo;
		json.githubHost = this.githubHost;
		json.ref = this.ref;
		json.path = this.path;

		if (this.bundle) {
			json.bundle = this.bundle;
		}
		if (this.stats !== Const.statsDefault) {
			json.stats = this.stats;
		}
		json.installed = {};

		this._installed.forEach((file: InstalledDef) => {
			json.installed[file.path] = {
				commit: file.commitSha
				// what more?
			};
		});
		// self-test (no corruption)
		this.validateJSON(json);

		return json;
	}

	toJSONString(): string {
		return this._stable.toJSONString(this.toJSON(), false);
	}

	parseJSONString(input: string, label: string = null): any {
		assertVar(input, 'string', 'input');
		this.parseJSON(this._stable.parseString(input), label);
	}

	parseJSON(json: any, label: string = null): any {
		assertVar(json, 'object', 'json');

		this.validateJSON(json, label);

		// TODO harden validation besides schema

		this._installed.clear();

		this.path = json.path;
		this.version = json.version;
		this.repo = json.repo;
		this.githubHost = json.githubHost;
		this.ref = json.ref;
		this.bundle = json.bundle;
		this.stats = (typeOf.isBoolean(json.stats) ? json.stats : Const.statsDefault);

		if (json.installed) {
			Object.keys(json.installed).forEach((filePath: string) => {
				var data = json.installed[filePath];
				var installed = new InstalledDef(filePath);
				// TODO validate some more
				installed.commitSha = data.commit;
				this._installed.set(filePath, installed);
			});
		}

		var reservedFields = ['path', 'version', 'repo', 'githubHost', 'ref', 'bundle', 'stats', 'installed'];
		var otherFieldKeys = Object.keys(json).filter(function (key) { return reservedFields.indexOf(key) === -1; });
		this.otherFields = otherFieldKeys.reduce(function (fields, key) {
			fields[key] = json[key];
			return fields;
		}, {});
	}

	validateJSON(json, label: string = null): any {
		Joi.assert(json, tsdSchema);
		return json;
	}
}

export = Config;
