/// <reference path="../_ref.d.ts" />

import ExposeContext = require('./ExposeContext');

interface ExposeHook {
	(ctx: ExposeContext):any;
}

export = ExposeHook;
