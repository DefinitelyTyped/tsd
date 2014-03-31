/// <reference path="../_ref.d.ts" />

'use strict';

import ExposeHook = require('./ExposeHook');

class ExposeCommand {
	name: string;
	execute: ExposeHook;
	index: number;

	label: string;
	hidden: boolean;
	options: string[] = [];
	variadic: string[] = [];
	groups: string[] = [];
	examples: string[][] = [];
	note: string[] = [];
	internal: boolean;
}

export = ExposeCommand;
