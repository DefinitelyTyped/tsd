/// <reference path="../_ref.d.ts" />

import ExposeContext = require('./ExposeContext');
import ExposeError = require('./ExposeError');

interface ExposeResult {
	ctx: ExposeContext;
	code: number;
	error?: ExposeError;
}

export = ExposeResult;
