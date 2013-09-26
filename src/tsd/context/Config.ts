///<reference path="../../_ref.d.ts" />
///<reference path="../../xm/io/FileUtil.ts" />
///<reference path="../../xm/iterate.ts" />
///<reference path="../../xm/ObjectUtil.ts" />
///<reference path="../../xm/io/Logger.ts" />
///<reference path="../../xm/data/PackageJSON.ts" />
///<reference path="../data/DefVersion.ts" />

module tsd {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var util = require('util');
	var assert = require('assert');
	var tv4:TV4 = require('tv4');

	/*
	 InstalledDef: single installed file in Config
	 */
	export class InstalledDef {

		path:string;
		commitSha:string;
		blobSha:string;

		constructor(path:string) {
			if (path) {
				xm.assertVar('path', path, 'string');
				this.path = path;
			}
		}

		update(file:tsd.DefVersion) {
			//TODO maybe too much testing? :D
			xm.assertVar('file', file, tsd.DefVersion);

			xm.assertVar('commit', file.commit, tsd.DefCommit);
			xm.assertVar('commit.sha', file.commit.commitSha, 'sha1');

			xm.assertVar('blob', file.blob, tsd.DefBlob);
			xm.assertVar('blob.sha', file.blob.sha, 'sha1');

			this.path = file.def.path;
			this.commitSha = file.commit.commitSha;
			this.blobSha = file.blob.sha;
		}

		toString():string {
			return this.path;
		}
	}

	/*
	 Config: local config file
	 */
	export class Config {

		typingsPath:string;
		version:string;
		repo:string;
		ref:string;

		private _installed:xm.KeyValueMap = new xm.KeyValueMap();
		private _schema:any;

		log:xm.Logger = xm.getLogger('Config');

		constructor(schema:any) {
			xm.assertVar('schema', schema, 'object');
			this._schema = schema;

			//import defaults
			this.typingsPath = tsd.Const.typingsFolder;
			this.version = tsd.Const.configVersion;
			this.repo = tsd.Const.definitelyRepo;
			this.ref = tsd.Const.mainBranch;

			xm.ObjectUtil.hidePrefixed(this);
			Object.defineProperty(this, 'log', {enumerable: false});
		}

		resolveTypingsPath(relativeToDir:string):string {
			var cfgFull = path.resolve(relativeToDir);
			var typings = this.typingsPath.replace(/[\\\/]/g, path.sep);

			if (/^([\\\/]|\w:)/.test(this.typingsPath)) {
				//absolute path
				return typings;
			}
			//relative
			return path.resolve(cfgFull, typings);
		}

		get repoOwner():string {
			return this.repo.split('/')[0];
		}

		get repoProject():string {
			return this.repo.split('/')[1];
		}

		get schema():any {
			return this._schema;
		}

		addFile(file:tsd.DefVersion) {
			xm.assertVar('file', file, tsd.DefVersion);

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

		hasFile(path:string):boolean {
			xm.assertVar('path', path, 'string');
			return this._installed.has(path);
		}

		getFile(path:string):tsd.InstalledDef {
			xm.assertVar('path', path, 'string');
			return this._installed.get(path, null);
		}

		removeFile(path:string) {
			xm.assertVar('path', path, 'string');
			this._installed.remove(path);
		}

		getInstalled():tsd.InstalledDef[] {
			return this._installed.values();
		}

		//TODO unit test this against JSON-Schema (maybe always?)
		toJSON():any {
			var json = {
				typingsPath: this.typingsPath,
				version: this.version,
				repo: this.repo,
				ref: this.ref,
				installed: {}
			};

			this._installed.values().forEach((file:tsd.InstalledDef) => {
				//xm.log(file);
				json.installed[file.path] = {
					commit: file.commitSha,
					blob: file.blobSha
					//what more?
				};
			});

			return json;
		}

		parseJSON(json:any) {
			xm.assertVar('json', json, 'object');

			this._installed.clear();

			var res = tv4.validateResult(json, this._schema);

			//TODO improve formatting (could bundle it in tv4?)
			if (!res.valid || res.missing.length > 0) {
				this.log.error(res.error.message);
				if (res.error.dataPath) {
					this.log.error(res.error.dataPath);
				}
				/*if (res.error.schemaPath) {
				 xm.log.error(res.error.schemaPath);
				 }*/
				throw (new Error('malformed config: doesn\'t comply with json-schema: ' + res.error.message + (res.error.dataPath ? ': ' + res.error.dataPath : '')));
			}

			//TODO harden validation besides schema
			this.typingsPath = json.typingsPath;
			this.version = json.version;
			this.repo = json.repo;
			this.ref = json.ref;

			if (json.installed) {
				xm.eachProp(json.installed, (data:any, path:string) => {
					var installed = new tsd.InstalledDef(path);
					//TODO move to class
					//TODO validate some more
					installed.commitSha = data.commit;
					installed.blobSha = data.blob;


					this._installed.set(path, installed);
				});
			}
		}
	}
}
