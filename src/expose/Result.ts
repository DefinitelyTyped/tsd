/// <reference path="../_ref.d.ts" />

import Context = require('./Context');
import ExposeError = require('./ExposeError');

interface Result {
	ctx: Context;
	code: number;
	error?: ExposeError;
}

export = Result;
