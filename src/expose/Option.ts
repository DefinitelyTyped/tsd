/// <reference path="../_ref.d.ts" />

'use strict';

import OptionApply = require('./ContextValueHandle');

class Option {
	name: string;
	description: string;
	short: string;
	type: string;
	placeholder: string;
	default: any;
	command: string;
	global: boolean = false;
	// TODO implement optional
	optional: boolean = true;
	enum: any[] = [];
	note: string[] = [];
	// TODO implement example
	apply: OptionApply;
}

export = Option;
