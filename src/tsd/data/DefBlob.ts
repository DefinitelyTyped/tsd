/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');
import DefVersion = require('./DefVersion');

class DefBlob {

	file: DefVersion;
	content: Buffer;

	constructor(file: DefVersion, buffer: Buffer) {
		assertVar(file, DefVersion, 'file');
		assertVar(buffer, Buffer, 'buffer');
		this.file = file;
		this.content = buffer;

		Object.freeze(this);
	}
}

export = DefBlob;
