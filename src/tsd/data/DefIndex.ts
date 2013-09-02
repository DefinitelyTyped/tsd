///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />
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

		private _branchName:string;
		private _hasIndex:bool = false;
		private _indexCommit:tsd.DefCommit;

		//TODO add generics when moved to TS 0.9
		private _definitions:xm.KeyValueMap = new xm.KeyValueMap();
		private _commits:xm.KeyValueMap = new xm.KeyValueMap();
		private _versions:xm.KeyValueMap = new xm.KeyValueMap();

		constructor() {

		}

		hasIndex():bool {
			return this._hasIndex;
		}

		// assumes recursive
		//TODO consider more verification or decoupling of data (low prio)
		init(branch:any, tree:any):void {
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
				throw new Error('missing branch and tree sha mismatch');
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

		setHistory(def:tsd.Def, commits:any[]):void {
			//force reset for robustness
			def.history = [];

			commits.map((json) => {
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

		private procureCommit(commitSha:string):tsd.DefCommit {
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

		private procureDef(path:string):tsd.Def {
			var def:tsd.Def = null;

			if (this._definitions.has(path)) {
				def = this._definitions.get(path);
			}
			else {
				def = Def.getFrom(path);
				if (def) {
					this._definitions.set(path, def);
				}
			}
			return def;
		}

		private procureVersion(def:tsd.Def, commit:tsd.DefCommit):tsd.DefVersion {
			var file:tsd.DefVersion;

			var key = def.path + '|' + commit.commitSha;

			if (this._versions.has(key)) {
				file = this._versions.get(key);
				//needed? should not happen..
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

		getFile(def:Def) {
			this._definitions.get(def.path, null);
		}

		hasPath(path:string):bool {
			return this._definitions.has(path);
		}

		getDefByPath(path:string):Def {
			return this._definitions.get(path, null);
		}

		getPaths():string[] {
			return this._definitions.values().map((file:Def) => {
				return file.path;
			});
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			this._definitions.values().forEach((def:Def) => {
				ret.push('  ' + def.toString());
				ret.push('  ' + def.head.toString());
				/*if (def.history) {
				 def.history.forEach((file:DefVersion) => {
				 ret.push('    - ' + file.toString());
				 });
				 }*/
			});
			return ret.join('\n');
		}

		get branchName():string {
			return this._branchName;
		}

		get list():Def[] {
			//need generics
			return <Def[]>this._definitions.values();
		}

		toString():string {
			return '[' + this._branchName + ']';
		}
	}
}