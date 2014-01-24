/// <reference path="../../_ref.d.ts" />
/// <reference path="../../xm/file.ts" />
/// <reference path="../../xm/iterate.ts" />
/// <reference path="../../xm/object.ts" />
/// <reference path="../../xm/Logger.ts" />
/// <reference path="../../xm/data/PackageJSON.ts" />
/// <reference path="../data/DefVersion.ts" />

module tsd {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var AssertionError = require('assertion-error');
	var tv4:TV4 = require('tv4');
	var reporter = require('tv4-reporter');

	/*
	 InstalledDef: single installed file in Config
	 */
	export class InstalledDef {

		path:string;
		commitSha:string;

		constructor(path:string) {
			if (path) {
				xm.assertVar(path, 'string', 'path');
				this.path = path;
			}
		}

		update(file:tsd.DefVersion) {
			xm.assertVar(file, tsd.DefVersion, 'file');

			xm.assertVar(file.commit, tsd.DefCommit, 'commit');
			xm.assertVar(file.commit.commitSha, 'sha1', 'commit.sha');

			this.path = file.def.path;
			this.commitSha = file.commit.commitSha;
		}

		toString():string {
			return this.path;
		}
	}

	/*
	 Config: local config file
	 */
	// TODO extract loading io to own class
	// TODO move parse/to/validate code to Koder (or it's replacement)
	export class Config implements git.GithubRepoConfig {

		path:string;
		version:string;
		repo:string;
		ref:string;

		private _installed:Map<string, tsd.InstalledDef> = new Map();
		private _schema:any;

		log:xm.Logger = xm.getLogger('Config');

		constructor(schema:any) {
			xm.assertVar(schema, 'object', 'schema');
			xm.assert((schema.version !== tsd.Const.configVersion), 'bad schema config version', schema.version, tsd.Const.configVersion, true);

			this._schema = schema;

			// import defaults
			this.reset();

			xm.object.hidePrefixed(this);
			Object.defineProperty(this, 'log', {enumerable: false});
		}

		reset():void {
			// import defaults
			this.path = tsd.Const.typingsDir;
			this.version = tsd.Const.configVersion;
			this.repo = tsd.Const.definitelyRepo;
			this.ref = tsd.Const.mainBranch;
			this._installed.clear();
		}

		resolveTypingsPath(relativeToDir:string):string {
			var cfgFull = path.resolve(relativeToDir);
			var typings = this.path.replace(/[\\\/]/g, path.sep);

			if (/^([\\\/]|\w:)/.test(this.path)) {
				// absolute path
				return typings;
			}
			// relative
			return path.resolve(cfgFull, typings);
		}

		get repoOwner():string {
			return this.repo.split('/')[0];
		}

		get repoProject():string {
			return this.repo.split('/')[1];
		}

		get repoRef():string {
			return this.repo + '#' + this.ref;
		}

		get schema():any {
			return this._schema;
		}

		addFile(file:tsd.DefVersion) {
			xm.assertVar(file, tsd.DefVersion, 'file');

			var def:tsd.InstalledDef;
			if (this._installed.has(file.def.path)) {
				def = this._installed.get(file.def.path);
			}
			else {
				def = new tsd.InstalledDef(file.def.path);
			}
			def.update(file);

			this._installed.set(file.def.path, def);
		}

		hasFile(filePath:string):boolean {
			xm.assertVar(filePath, 'string', 'filePath');
			return this._installed.has(filePath);
		}

		getFile(filePath:string):tsd.InstalledDef {
			xm.assertVar(filePath, 'string', 'filePath');
			return this._installed.has(filePath) ? this._installed.get(filePath) : null;
		}

		removeFile(filePath:string) {
			xm.assertVar(filePath, 'string', 'filePath');
			this._installed.delete(filePath);
		}

		getInstalled():tsd.InstalledDef[] {
			return xm.valuesOf(this._installed);
		}

		getInstalledPaths():string[] {
			return xm.valuesOf(this._installed).map((value:InstalledDef) => {
				return value.path;
			});
		}

		toJSON():any {
			var json = {
				path: this.path,
				version: this.version,
				repo: this.repo,
				ref: this.ref,
				installed: {}
			};

			xm.keysOf(this._installed).forEach((key:string) => {
				var file = this._installed.get(key);
				json.installed[file.path] = {
					commit: file.commitSha
					// what more?
				};
			});
			// self-test (no corruption)
			this.validateJSON(json, this._schema);

			return json;
		}

		parseJSON(json:any, label?:string):any {
			xm.assertVar(json, 'object', 'json');

			this.validateJSON(json, this._schema, label);

			// TODO harden validation besides schema

			this._installed.clear();

			this.path = json.path;
			this.version = json.version;
			this.repo = json.repo;
			this.ref = json.ref;

			if (json.installed) {
				xm.eachProp(json.installed, (data:any, filePath:string) => {
					var installed = new tsd.InstalledDef(filePath);
					// TODO validate some more
					installed.commitSha = data.commit;
					this._installed.set(filePath, installed);
				});
			}
		}

		validateJSON(json:any, schema:any, label?:string):any {
			xm.assertVar(schema, 'object', 'schema');

			label = (label || '<config json>');
			var res = tv4.validateMultiple(json, schema);
			if (!res.valid || res.missing.length > 0) {
				xm.log.out.ln();
				var report = reporter.getReporter(xm.log.out.getWrite(), xm.log.out.getStyle());
				report.reportResult(report.createTest(schema, json, label, res, true), '   ');
				xm.log.out.ln();
				throw (new Error('malformed config: doesn\'t comply with schema'));
			}
			return json;
		}
	}
}
