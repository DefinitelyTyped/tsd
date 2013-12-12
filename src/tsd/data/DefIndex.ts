/// <reference path="../_ref.ts" />
/// <reference path="../../git/model/GithubJSON.ts" />
/// <reference path="../../xm/object.ts" />
/// <reference path="DefCommit.ts" />

module tsd {
	'use strict';

	var pointer = require('json-pointer');
	var commit_sha:string = '/commit/sha';
	var branch_tree_sha:string = '/commit/commit/tree/sha';

	/*
	 DefIndex: holds the data for a repo branch in git

	 for now loosely coupled to the github api version, might be possible to de-couple, at least from the format version (but not really worth it?)
	 */
	//TODO consider de-coupling with github api fomat or at least verify more
	export class DefIndex {

		private _branchName:string = null;
		private _hasIndex:boolean = false;
		private _indexCommit:tsd.DefCommit = null;

		private _definitions = new Map<string, tsd.Def>();
		private _commits = new Map<string, tsd.DefCommit>();
		private _blobs = new Map<string, tsd.DefBlob>();
		private _versions = new Map<string, tsd.DefVersion>();

		constructor() {
			//hide from inspect()
			xm.object.hidePrefixed(this);
		}

		hasIndex():boolean {
			return this._hasIndex;
		}

		/*
		 init from branch (commit) and tree json, assumes recursive tree
		 */
		//TODO add more input data verification
		//TODO consider decoupling of github api data (low prio)
		init(branch:any, tree:any):void {
			xm.assertVar(branch, 'object', 'branch');
			xm.assertVar(tree, 'object', 'tree');

			if (this._hasIndex) {
				return;
			}

			this._blobs.clear();
			this._commits.clear();
			this._versions.clear();
			this._definitions.clear();

			xm.assertVar(branch, 'object', 'branch');
			xm.assertVar(tree, 'object', 'tree');

			var commitSha = pointer.get(branch, commit_sha);
			var treeSha = tree.sha;
			var sha = pointer.get(branch, branch_tree_sha);

			xm.assertVar(sha, 'string', 'sha');
			xm.assertVar(treeSha, 'string', 'treeSha');
			xm.assertVar(commitSha, 'string', 'commitSha');

			//verify tree is from branch (compare sha's)
			if (sha !== treeSha) {
				throw new Error('branch and tree sha mismatch');
			}

			this._branchName = branch.name;

			this._indexCommit = this.procureCommit(commitSha);
			this._indexCommit.parseJSON(branch.commit);

			var def:tsd.Def;
			var file:tsd.DefVersion;

			xm.eachElem(tree.tree, (elem:git.GithubJSONTreeElem) => {
				var char = elem.path.charAt(0);
				if (elem.type === 'blob' && char !== '.' && char !== '_' && Def.isDefPath(elem.path)) {
					def = this.procureDef(elem.path);
					if (!def) {
						return;
					}
					file = this.procureVersion(def, this._indexCommit);
					if (!file) {
						return;
					}
					if (!file.blob) {
						file.setContent(this.procureBlob(elem.sha));
					}
					def.head = file;
				}
			});
			this._hasIndex = true;
		}

		/*
		 set the history of a single Def from json data
		 */
		setHistory(def:tsd.Def, commitJsonArray:any[]):void {
			xm.assertVar(def, tsd.Def, 'def');
			xm.assertVar(commitJsonArray, 'array', 'commits');

			//force reset for robustness
			def.history = [];

			//TODO harden data validation
			commitJsonArray.map((json) => {
				if (!json || !json.sha) {
					xm.log.inspect(json, 1, 'weird: json no sha');
				}
				var commit = this.procureCommit(json.sha);
				if (!commit) {
					xm.log.inspect('weird: no commit for sha ' + json.sha);
					throw new Error('huh?');
				}
				if (!commit.hasMeta) {
					commit.parseJSON(json);
				}
				def.history.push(this.procureVersion(def, commit));
			});
		}

		/*
		 get a DefCommit for a sha (enforces single instances)
		 */
		procureCommit(commitSha:string):tsd.DefCommit {
			xm.assertVar(commitSha, 'sha1', 'commitSha');

			var commit:tsd.DefCommit;
			if (this._commits.has(commitSha)) {
				commit = this._commits.get(commitSha);
			}
			else {
				commit = new tsd.DefCommit(commitSha);
				this._commits.set(commitSha, commit);
			}
			return commit;
		}

		/*
		 get a DefBlob for a sha (enforces single instances)
		 */
		procureBlob(blobSha:string):tsd.DefBlob {
			xm.assertVar(blobSha, 'sha1', 'blobSha');

			var blob:tsd.DefBlob;
			if (this._blobs.has(blobSha)) {
				blob = this._blobs.get(blobSha);
			}
			else {
				blob = new tsd.DefBlob(blobSha);
				this._blobs.set(blobSha, blob);
			}
			return blob;
		}

		/*
		 get a DefBlob for a sha (enforces single instances)
		 */
		procureBlobFor(content:NodeBuffer, encoding:string = null):tsd.DefBlob {
			xm.assertVar(content, Buffer, 'content');

			var sha = git.GitUtil.blobShaHex(content, encoding);
			var blob:tsd.DefBlob = this.procureBlob(sha);
			if (!blob.hasContent()) {
				blob.setContent(content);
			}
			return blob;
		}

		/*
		 get a Def for a path (enforces single instances)
		 */
		procureDef(path:string):tsd.Def {
			xm.assertVar(path, 'string', 'path');

			var def:tsd.Def = null;

			if (this._definitions.has(path)) {
				def = this._definitions.get(path);
			}
			else {
				def = Def.getFrom(path);
				if (!def) {
					throw new Error('cannot parse path to def: ' + path);
				}
				this._definitions.set(path, def);
			}
			return def;
		}

		/*
		 get a DefVersion for a Def + DefCommit combination (enforces single instances)
		 */
		procureVersion(def:tsd.Def, commit:tsd.DefCommit):tsd.DefVersion {
			xm.assertVar(def, tsd.Def, 'def');
			xm.assertVar(commit, tsd.DefCommit, 'commit');

			var file:tsd.DefVersion;

			var key = def.path + '|' + commit.commitSha;

			if (this._versions.has(key)) {
				file = this._versions.get(key);
				//NOTE: should not happen but keep robust
				if (file.def !== def) {
					throw new Error('weird: internal data mismatch: version does not belong to file: ' + file.def + ' -> ' + commit);
				}
			}
			else {
				file = new DefVersion(def, commit);
				this._versions.set(key, file);
			}
			return file;
		}

		/*
		 attempt to get a DefVersion (and its Def and DefCommit) for a path + commitSha combination (enforces single instances)
		 */
		procureVersionFromSha(path:string, commitSha:string):tsd.DefVersion {
			xm.assertVar(path, 'string', 'path');
			xm.assertVar(commitSha, 'sha1', 'commitSha');

			var def = this.getDef(path);
			if (!def) {
				xm.log.warn('path not in index, attempt-adding: ' + path);

				//attempt creation
				def = this.procureDef(path);
			}
			if (!def) {
				throw new Error('cannot procure definition for path: ' + path);
			}

			var commit = this.procureCommit(commitSha);
			if (!commit) {
				throw new Error('cannot procure commit for path: ' + path + ' -> commit: ' + commitSha);
			}
			if (!commit.hasMetaData()) {
				//TODO always load meta data? meh? waste of requests?
			}
			var file = this.procureVersion(def, commit);
			if (!file) {
				throw new Error('cannot procure definition version for path: ' + path + ' -> commit: ' + commit.commitSha);
			}
			// need to look it up

			return file;
		}

		getDef(path:string):tsd.Def {
			return this._definitions.get(path);
		}

		hasDef(path:string):boolean {
			return this._definitions.has(path);
		}

		getBlob(sha:string):tsd.DefBlob {
			return this._blobs.get(sha);
		}

		hasBlob(sha:string):boolean {
			return this._blobs.has(sha);
		}

		getCommit(sha:string):tsd.DefCommit {
			return this._commits.get(sha);
		}

		hasCommit(sha:string):boolean {
			return this._commits.has(sha);
		}

		getPaths():string[] {
			return xm.valuesOf(this._definitions).map((file:Def) => {
				return file.path;
			});
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			var arr = xm.valuesOf(this._definitions);
			arr.forEach((def:Def) => {
				ret.push('  ' + def.toString());
				//ret.push('  ' + def.head.toString());
				/*if (def.history) {
				 def.history.forEach((file:DefVersion) => {
				 ret.push('    - ' + file.toString());
				 });
				 }*/
			});
			return ret.join('\n') + '\n' + 'total ' + arr.length + ' definitions';
		}

		get branchName():string {
			return this._branchName;
		}

		get list():Def[] {
			//need generics :)
			return <Def[]>xm.valuesOf(this._definitions);
		}

		get indexCommit():tsd.DefCommit {
			return this._indexCommit;
		}

		toString():string {
			return '[' + this._branchName + ']';
		}
	}
}
