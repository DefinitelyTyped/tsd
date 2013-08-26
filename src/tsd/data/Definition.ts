///<reference path="../_ref.ts" />
///<reference path="../context/Context.ts" />

module tsd {

	var pointer = require('jsonpointer.js');

	var defExp:RegExp = /^(\w[\w_\.-]+?\w)\/(\w[\w_\.-]+?\w)\.d\.ts$/g;

	export interface GitTreeElem{
		mode:string;
		type:string;
		sha:string;
		path:string;
		size:number;
		url:string;
	}

	//single definition file in repo (non-parsed)
	export class DefFile {

		public path:string;
		public project:string;
		public name:string;
		public semver:string;
		public head:DefCommit;

		constructor(path?:string) {
			this.path = path;
		}

		toString():string {
			return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
		}

		combi():string {
			return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
		}

		static getFrom(path:string, sha:string):DefFile {
			defExp.lastIndex = 0;
			var match = defExp.exec(path);
			if (!match) {
				return null;
			}
			if (match.length < 1) {
				return null;
			}
			if (match[1].length < 1 || match[2].length < 1) {
				return null;
			}
			var file = new DefFile(path);
			file.project = match[1];
			file.name = match[2];
			// path.semver = match[3];

			file.head = new DefCommit(file, sha);

			return file;
		}
	}

	//single definition file in repo (non-parsed)
	export class DefCommit {

		public sha:string;
		public date:Date;
		public file:DefFile;

		// linked list (only care for single chain
		public newer:DefCommit;
		public older:DefCommit;

		constructor(file:DefFile, sha:string) {
			this.file = file;
			this.sha = sha;
		}

		get head():DefCommit {
			var def:DefCommit = this;
			while (def.newer) {
				def = def.newer;
			}
			return def;
		}

		get short():string {
			return (this.sha ? this.sha.substr(0, 8) : '<no sha>');
		}

		toString():string {
			var str = (this.file ? this.file.path : '<no file>');
			str += ' : ' + (this.sha ? this.sha.substr(0, 8) : '<no sha>');
			str += (this.date ? ' : ' + this.date.toString() : '');
			return str;
		}
	}

	var commit_sha:string = '/commit/sha';

	export class DefinitionData {

		private _branchName:string;
		private _treeSha:string;
		private _commitSha:string;
		private _list:DefFile[] = [];

		constructor() {

		}

		hasBranch():bool {
			return !!this._branchName && this._list.length > 0;
		}

		setBranch(branch:any, tree:any):void {
			xm.assertVar('branch', branch, 'object');
			xm.assertVar('tree', tree, 'object');

			this._branchName = branch.name;
			this._commitSha = pointer.get(branch, commit_sha);
			this._treeSha = tree.sha;
			this._list = [];

			var def:DefFile;

			tree.tree.forEach((elem:GitTreeElem) => {
				var char = elem.path.charAt(0);
				if (elem.type === 'blob' && char !== '.' && char !== '_') {
					def = DefFile.getFrom(elem.path, elem.sha);
					if (def) {
						this.addFile(def);
					}
				}
			}, this);
		}

		getPaths():string[] {
			return this._list.map((file:DefFile) => {
				return file.path;
			}, this);
		}

		toDump():string {
			var ret:string[] = [];
			ret.push(this.toString());
			this._list.forEach((file:DefFile) => {
				ret.push('  ' + file.toString());
				var def = file.head;
				while (def) {
					ret.push('    - ' + def.short);
					def = def.newer;
				}
			}, this);
			return ret.join('\n');
		}

		toString():string {
			return '[' + this._branchName + ']';
		}

		addFile(def:DefFile) {
			this._list.push(def);
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

		get list():DefFile[] {
			return this._list;
		}
	}
}
