/// <reference path="../_ref.d.ts" />

import Command = require('./Command');

interface Sorter {
	(one: Command, two: Command):number;
}

export = Sorter;
