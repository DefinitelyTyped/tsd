///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />

module tsd {

	var pointer = require('jsonpointer.js');
	var commit_sha:string = '/commit/sha';

	export class DefIndex {

		private _branchName:string;
		private _treeSha:string;
		private _commitSha:string;
		//TODO swap for set
		private _list:xm.Set = new xm.Set();
		private _map:xm.KeyValueMap = new xm.KeyValueMap();

		constructor() {

		}

		hasData():bool {
			return !!this._branchName && this._list.count() > 0;
		}

		// assume recursive
		setBranchTree(branch:any, tree:any):void {
			xm.assertVar('branch', branch, 'object');
			xm.assertVar('tree', tree, 'object');

			this._branchName = branch.name;
			this._commitSha = pointer.get(branch, commit_sha);
			this._treeSha = tree.sha;
			this._list.clear();
			this._map.clear();

			var def:tsd.Def;

			tree.tree.forEach((elem:git.GithubJSONTreeElem) => {
				var char = elem.path.charAt(0);
				if (elem.type === 'blob' && char !== '.' && char !== '_') {
					def = tsd.Def.getFrom(elem.path, elem.sha, this._commitSha);
					if (def) {
						this.addFile(def);
					}
				}
			}, this);
		}

		addFile(def:tsd.Def) {
			this._list.add(def);
			this._map.set(def.path, def);
		}

		hasPath(path:string):bool {
			return this._map.has(path);
		}

		getFileByPath(path:string):tsd.Def {
			return this._map.get(path, null);
		}

		getPaths():string[] {
			return this._list.values().map((file:tsd.Def) => {
				return file.path;
			}, this);
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			this._list.values().forEach((file:tsd.Def) => {
				ret.push('  ' + file.toString());
				var def = file.head;
				while (def) {
					ret.push('    - ' + def.short);
					def = def.older;
				}
			}, this);
			return ret.join('\n');
		}

		toString():string {
			return '[' + this._branchName + ']';
		}

		get branchName():string {
			return this._branchName;
		}

		get commitSha():string {
			return this._commitSha;
		}

		get treeSha():string {
			return this._treeSha;
		}

		get list():tsd.Def[] {
			//need generics
			return <tsd.Def[]>this._list.values();
		}
	}
}