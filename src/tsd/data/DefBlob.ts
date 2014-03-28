/// <reference path="../_ref.ts" />
/// <reference path="../../../typings/fixes.d.ts" />
/// <reference path="../../git/GitUtil.ts" />
/// <reference path="../../xm/typeOf.ts" />

module tsd {
	'use strict';

	export class DefBlob {
		sha:string = null;
		content:NodeBuffer = null;
		encoding:string = 'utf8';

		constructor(sha:string, content:any = null, encoding:string = null) {
			xm.assertVar(sha, 'sha1', 'sha');
			this.sha = sha;
			this.encoding = encoding;

			xm.object.defineProps(this, ['sha', 'encoding'], {writable: false});

			if (content) {
				this.setContent(content);
			}
			else {
				Object.defineProperty(this, 'content', {enumerable: false});
			}
		}

		hasContent():boolean {
			return xm.isValid(this.content);
		}

		setContent(content:NodeBuffer, encoding?:string):void {
			xm.assertVar(content, Buffer, 'content');
			if (xm.isValid(this.content)) {
				throw new Error('content already set: ' + this.sha);
			}

			var sha = git.GitUtil.blobShaHex(content);
			if (sha !== this.sha) {
				xm.throwAssert('blob sha mismatch: ' + sha + ' != ' + this.sha, sha, this.sha);
			}

			xm.object.defineProp(this, 'content', {writable: true});
			this.content = content;
			xm.object.defineProp(this, 'content', {writable: false, enumerable: false});
		}

		// human friendly
		get shaShort():string {
			return this.sha ? tsd.shaShort(this.sha) : '<no sha>';
		}

		toString():string {
			return this.shaShort;
		}
	}
}
