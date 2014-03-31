/// <reference path="../_ref.d.ts" />

import typeOf = require('../../xm/typeOf');
import assertVar = require('../../xm/assertVar');
import assert = require('../../xm/assert');
import objectUtils = require('../../xm/objectUtils');
import gitUtil = require('../../git/gitUtil');
import tsdUtil = require('../util/tsdUtil');

'use strict';

class DefBlob {
	sha: string = null;
	content: NodeBuffer = null;
	encoding: string = 'utf8';

	constructor(sha: string, content: any = null, encoding: string = null) {
		assertVar(sha, 'sha1', 'sha');
		this.sha = sha;
		this.encoding = encoding;

		objectUtils.defineProps(this, ['sha', 'encoding'], {writable: false});

		if (content) {
			this.setContent(content);
		}
		else {
			Object.defineProperty(this, 'content', {enumerable: false});
		}
	}

	hasContent(): boolean {
		return typeOf.isValid(this.content);
	}

	setContent(content: NodeBuffer, encoding?: string): void {
		assertVar(content, Buffer, 'content');
		if (typeOf.isValid(this.content)) {
			throw new Error('content already set: ' + this.sha);
		}

		var sha = gitUtil.blobShaHex(content, encoding || this.encoding);
		assert(sha === this.sha, 'blob sha mismatch: ' + sha + ' != ' + this.sha, sha, this.sha);

		objectUtils.defineProp(this, 'content', {writable: true});
		this.content = content;
		objectUtils.defineProp(this, 'content', {writable: false, enumerable: false});
	}

	// human friendly
	get shaShort(): string {
		return this.sha ? tsdUtil.shaShort(this.sha) : '<no sha>';
	}

	toString(): string {
		return this.shaShort;
	}
}

export = DefBlob;
