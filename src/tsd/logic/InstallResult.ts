/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');
import Options = require('../Options');

import DefVersion = require('../data/DefVersion');

class InstallResult {

	options: Options;
	written = new Map<string, DefVersion>();
	removed = new Map<string, DefVersion>();
	skipped = new Map<string, DefVersion>();

	constructor(options: Options) {
		assertVar(options, Options, 'options');
		this.options = options;
	}
}

export = InstallResult;
