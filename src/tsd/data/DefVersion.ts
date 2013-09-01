///<reference path="../_ref.ts" />
///<reference path="Def.ts" />
///<reference path="DefInfo.ts" />

module tsd {

	export class DefVersion {

		private _def:tsd.Def;
		//commit
		private _commit:tsd.DefCommit;
		creationCommit:bool;

		//NOTE blobs are not workable with
		//blobSha:string;

		content:string;
		dependencies:tsd.DefVersion[] = [];

		info:tsd.DefInfo;


		constructor(def:tsd.Def, commit:tsd.DefCommit) {
			xm.assertVar('def', def, tsd.Def);
			xm.assertVar('commit', commit, tsd.DefCommit);

			this._def = def;
			this._commit = commit;
		}

		get def():tsd.Def {
			return this._def;
		}

		get commit():tsd.DefCommit {
			return this._commit;
		}

		toString():string {
			var str = (this._def ? this._def.path : '<no def>');
			str += ' : ' + (this.commit ? this.commit.commitShort : '<no blob-sha>');
			return str;
		}
	}
}