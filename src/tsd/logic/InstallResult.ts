/// <reference path="../_ref.d.ts" />

'use strict';

import collection = require('../../xm/collection');
import assertVar = require('../../xm/assertVar');
import Options = require('../Options');

import DefVersion = require('../data/DefVersion');

class InstallResult {

	options: Options;

	written = new collection.Hash<DefVersion>();
	removed = new collection.Hash<DefVersion>();
	skipped = new collection.Hash<DefVersion>();

	constructor(options: Options) {
		assertVar(options, Options, 'options');
		this.options = options;
	}
}

export = InstallResult;
