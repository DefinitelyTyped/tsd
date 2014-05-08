/// <reference path="../_ref.d.ts" />

'use strict';

import Hook = require('./ContextHandle');

class Command {
	name: string;
	execute: Hook;
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

export = Command;
