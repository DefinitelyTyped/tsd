/// <reference path="../_ref.d.ts" />

import ExposeCommand = require('./ExposeCommand');

interface ExposeSorter {
	(one: ExposeCommand, two: ExposeCommand):number;
}

export = ExposeSorter;
