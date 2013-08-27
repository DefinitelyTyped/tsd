///<reference path="../_ref.ts" />
///<reference path="../../git/GithubJSON.ts" />

module tsd {

	var pointer = require('jsonpointer.js');
	var commit_sha:string = '/commit/sha';

	export class DefinitionIndex {

		private _branchName:string;
		private _treeSha:string;
		private _commitSha:string;
		private _list:tsd.Definition[] = [];

		constructor() {

		}

		hasData():bool {
			return !!this._branchName && this._list.length > 0;
		}

		// assume recursive
		setBranchTree(branch:any, tree:any):void {
			xm.assertVar('branch', branch, 'object');
			xm.assertVar('tree', tree, 'object');

			this._branchName = branch.name;
			this._commitSha = pointer.get(branch, commit_sha);
			this._treeSha = tree.sha;
			this._list = [];

			var def:tsd.Definition;

			tree.tree.forEach((elem:git.GithubJSONTreeElem) => {
				var char = elem.path.charAt(0);
				if (elem.type === 'blob' && char !== '.' && char !== '_') {
					def = tsd.Definition.getFrom(elem.path, elem.sha, this._commitSha);
					if (def) {
						this.addFile(def);
					}
				}
			}, this);
		}

		addFile(def:tsd.Definition) {
			//TODO enforce unique?
			this._list.push(def);
		}

		getPaths():string[] {
			return this._list.map((file:tsd.Definition) => {
				return file.path;
			}, this);
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			this._list.forEach((file:tsd.Definition) => {
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

		get list():tsd.Definition[] {
			return this._list;
		}
	}
}