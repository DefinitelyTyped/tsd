/// <reference path="../_ref.d.ts" />

import ExposeResult = require('./ExposeResult');

interface ExposeHandle {
	(res: ExposeResult):any;
}

export = ExposeHandle;
