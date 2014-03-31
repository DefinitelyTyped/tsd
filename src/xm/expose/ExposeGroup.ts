/// <reference path="../_ref.d.ts" />

'use strict';

import ExposeSorter = require('./ExposeSorter');
import sorter = require('./sorter');

class ExposeGroup {
	name: string;
	label: string;
	index: number;
	sorter: ExposeSorter = sorter.exposeSortIndex;
	options: string[] = [];

	constructor() {
	}
}

export = ExposeGroup;
