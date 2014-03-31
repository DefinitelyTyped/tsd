/// <reference path="../_ref.d.ts" />

'use strict';

import ExposeResult = require('./ExposeResult');

interface ExposeHandle {
	(res: ExposeResult):any;
}

export = ExposeHandle;
