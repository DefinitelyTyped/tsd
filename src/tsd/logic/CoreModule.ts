/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import eventLog = require('../../xm/lib/eventLog');

import Core = require('./Core');

class CoreModule {

	core: Core;
	label: string;

	constructor(core: Core, label: string) {
		this.core = core;
		this.label = label;
	}
}

export = CoreModule;
