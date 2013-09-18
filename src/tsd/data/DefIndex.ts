///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />
///<reference path="../../xm/ObjectUtil.ts" />
///<reference path="DefCommit.ts" />

module tsd {

	var pointer = require('jsonpointer.js');
	var commit_sha:string = '/commit/sha';

	var branch_tree_sha:string = '/commit/commit/tree/sha';

	/*
	 DefIndex: holds the data for a repo branch in git

	 for now loosely coupled to the github api version, might be possible to de-couple, at least from the format version (but not really worth it?)
	 */
	//TODO consider cutting coupling with github api fomat or at least verifying more (low prio)
	export class DefIndex {

		private _branchName:string = null;
		private _hasIndex:bool = false;
		private _indexCommit:tsd.DefCommit = null;

		//TODO add generics when moved to TS 0.9
		private _definitions:xm.IKeyValueMap = new xm.KeyValueMap();
		private _commits:xm.IKeyValueMap = new xm.KeyValueMap();
		private _versions:xm.IKeyValueMap = new xm.KeyValueMap();

		constructor() {

			//hide from inspect()
			xm.ObjectUtil.hidePrefixed(this);
		}

		hasIndex():bool {
			return this._hasIndex;
		}

		/*
		 init from branch (commit) and tree json, assumes recursive tree
		 */
		//TODO add more input data verification
		//TODO consider decoupling of github api data (low prio)
		init(branch:any, tree:any):void {
			xm.assertVar('branch', branch, 'object');
			xm.assertVar('tree', tree, 'object');

			if (this._hasIndex) {
				return;
			}

			this._commits.clear();
			this._versions.clear();
			this._definitions.clear();

			xm.assertVar('branch', branch, 'object');
			xm.assertVar('tree', tree, 'object');

			var commitSha = pointer.get(branch, commit_sha);
			var treeSha = tree.sha;
			var sha = pointer.get(branch, branch_tree_sha);

			xm.assertVar('sha', sha, 'string');
			xm.assertVar('treeSha', treeSha, 'string');
			xm.assertVar('commitSha', commitSha, 'string');

			//verify tree is from branch (compare sha's)
			if (sha !== treeSha) {
				throw new Error('branch and tree sha mismatch');
			}

			this._branchName = branch.name;

			this._indexCommit = this.procureCommit(commitSha);
			this._indexCommit.parseJSON(branch.commit);

			var def:tsd.Def;
			var file:tsd.DefVersion;

			tree.tree.forEach((elem:git.GithubJSONTreeElem) => {
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
					def.head = file;
				}
			});
			this._hasIndex = true;
		}

		/*
		 set the history of a single file from from json data
		 */
		setHistory(def:tsd.Def, commitJsonArray:any[]):void {
			xm.assertVar('def', def, tsd.Def);
			xm.assertVar('commits', commitJsonArray, 'array');

			//force reset for robustness
			def.history = [];

			//TODO harden data validation
			commitJsonArray.map((json) => {
				if (!json || !json.sha) {
					xm.log.inspect(json, 'weird: json no sha');
				}
				var commit = this.procureCommit(json.sha);
				if (!commit) {
					xm.log.inspect('weird: no commit for sha ' + json.sha);
					throw new Error('huh?');
				}
				commit.parseJSON(json);

				def.history.push(this.procureVersion(def, commit));
			});
		}

		/*
		 get a DefCommit for a sha (enforces single instances)
		 */
		procureCommit(commitSha:string):tsd.DefCommit {
			xm.assertVar('commitSha', commitSha, 'sha1');

			var commit:tsd.DefCommit;
			if (this._commits.has(commitSha)) {
				commit = this._commits.get(commitSha);
			}
			else {
				commit = new DefCommit(commitSha);
				this._commits.set(commitSha, commit);
			}
			return commit;
		}

		/*
		 get a Def for a path (enforces single instances)
		 */
		procureDef(path:string):tsd.Def {
			xm.assertVar('path', path, 'string');

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
			xm.assertVar('def', def, tsd.Def);
			xm.assertVar('commit', commit, tsd.DefCommit);

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
			xm.assertVar('path', path, 'string');
			xm.assertVar('commitSha', commitSha, 'sha1');

			var def:tsd.Def = this.getDef(path);
			if (!def) {
				xm.log.warn('path not in index, attempt-adding: ' + path);

				//attempt creation
				def = this.procureDef(path);
			}
			if (!def) {
				throw new Error('cannot procure definition for path: ' + path);
			}

			var commit:tsd.DefCommit = this.procureCommit(commitSha);
			if (!commit) {
				throw new Error('cannot procure commit for path: ' + path + ' -> commit: ' + commitSha);
			}
			if (!commit.hasMetaData()) {
				//TODO always load meta data? meh?
			}
			var file:tsd.DefVersion = this.procureVersion(def, commit);
			if (!file) {
				throw new Error('cannot procure definition version for path: ' + path + ' -> commit: ' + commit.commitSha);
			}
			// need to look it up

			return file;
		}

		getDef(path:string):tsd.Def {
			return this._definitions.get(path, null);
		}

		hasDef(path:string):bool {
			return this._definitions.has(path);
		}

		getPaths():string[] {
			return this._definitions.values().map((file:Def) => {
				return file.path;
			});
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			var arr = this._definitions.values();
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
			return <Def[]>this._definitions.values();
		}

		get indexCommit():tsd.DefCommit {
			return this._indexCommit;
		}

		toString():string {
			return '[' + this._branchName + ']';
		}
	}
}