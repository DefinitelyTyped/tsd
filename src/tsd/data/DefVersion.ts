///<reference path="../_ref.ts" />
///<reference path="Def.ts" />
///<reference path="DefInfo.ts" />

module tsd {

	/*
	 DefVersion: version of a definition (the file content in the repo)

	 NOTE: for practical reasons linked to a commit (tree) instead of a blob
	 */
	export class DefVersion {

		private _def:tsd.Def;
		private _commit:tsd.DefCommit;

		//NOTE blobs are not workable with raw.github and api rate-limits
		//blobSha:string;

		//raw text content
		content:string;

		//parse from tags
		dependencies:tsd.DefVersion[] = [];
		solved:bool = false;

		//parsed from header
		info:tsd.DefInfo;

		constructor(def:tsd.Def, commit:tsd.DefCommit) {
			xm.assertVar('def', def, tsd.Def);
			xm.assertVar('commit', commit, tsd.DefCommit);

			this._def = def;
			this._commit = commit;
		}

		get key():string {
			if (!this._def || !this._commit) {
				return null;
			}
			return this._def.path + '-' + this._commit.commitSha;
		}

		get def():tsd.Def {
			return this._def;
		}

		get commit():tsd.DefCommit {
			return this._commit;
		}

		toString():string {
			var str = (this._def ? this._def.path : '<no def>');
			str += ' : ' + (this._commit ? this._commit.commitShort : '<no blob-sha>');
			return str;
		}
	}
}