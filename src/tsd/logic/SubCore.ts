/// <reference path="../_ref.d.ts" />

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');
import eventLog = require('../../xm/lib/eventLog');

import Core = require('./Core');

class SubCore {

	core: Core;
	private _verbose: boolean = false;

	constructor(core: Core, track: string, label: string) {
		this.core = core;
	}

	set verbose(verbose: boolean) {
	}

	get verbose(): boolean {
		return this._verbose;
	}
}

export = SubCore;
