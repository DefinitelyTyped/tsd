///<reference path="../_ref.ts" />
///<reference path="Def.ts" />
///<reference path="DefInfo.ts" />
///<reference path="DefBlob.ts" />
///<reference path="../../git/GitUtil.ts" />

module tsd {
	'use strict';

	/*
	 DefVersion: version of a definition (the file content in the repo)

	 NOTE: for practical reasons linked to a commit (tree) instead of a blob
	 */
	export class DefVersion {
		//TODO swap for non-writable properties?
		private _def:tsd.Def = null;
		private _commit:tsd.DefCommit = null;

		//NOTE blobs are impractical to work with: api rate-limits and no access over raw.github
		private _blob:tsd.DefBlob = null;

		//parse from tags
		dependencies:tsd.Def[] = [];
		solved:boolean = false;

		//parsed from header
		info:tsd.DefInfo;

		constructor(def:tsd.Def, commit:tsd.DefCommit) {
			xm.assertVar('def', def, tsd.Def);
			xm.assertVar('commit', commit, tsd.DefCommit);

			this._def = def;
			this._commit = commit;

			xm.ObjectUtil.hidePrefixed(this);
		}

		setContent(blob:tsd.DefBlob):void {
			xm.assertVar('blob', blob, tsd.DefBlob);
			if (this._blob) {
				throw new Error('already got a blob: ' + this._blob.sha + ' != ' + blob.sha);
			}
			this._blob = blob;
		}

		hasContent():boolean {
			return (this._blob && this._blob.hasContent());
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

		get blob():tsd.DefBlob {
			return this._blob;
		}

		toString():string {
			var str = (this._def ? this._def.path : '<no def>');
			str += ' : ' + (this._commit ? this._commit.commitShort : '<no commit>');
			str += ' : ' + (this._blob ? this._blob.shaShort : '<no blob>');
			return str;
		}
	}
}
