///<reference path="../_ref.ts" />
///<reference path="DefVersion.ts" />

module tsd {

	//single definition in repo (identified by it path)
	export class Definition {

		// unique identifier: 'project/name' (should be 'project/name-v0.1.3-alpha')
		public path:string;

		// split
		public project:string;
		public name:string;
		//used?
		public semver:string;

		// head of a linked-list of versions in the git repo
		public head:tsd.DefVersion;

		constructor(path?:string) {
			this.path = path;
		}

		toString():string {
			return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
		}

		static getFrom(path:string, blobSha:string, commitSha:string):tsd.Definition {
			var defExp:RegExp = /^(\w[\w_\.-]+?\w)\/(\w[\w_\.-]+?\w)\.d\.ts$/g;
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
			var file = new tsd.Definition(path);
			file.project = match[1];
			file.name = match[2];
			// path.semver = match[3];

			file.head = new tsd.DefVersion(file, blobSha, commitSha);

			return file;
		}
	}
}
