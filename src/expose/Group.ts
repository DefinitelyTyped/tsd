/// <reference path="../_ref.d.ts" />

'use strict';

import CommandSorter = require('./CommandSorter');
import sorter = require('./sorter');

class Group {
	name: string;
	label: string;
	index: number;
	sorter: CommandSorter = sorter.sortCommand;
	options: string[] = [];

	constructor() {
	}
}

export = Group;
