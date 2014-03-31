/// <reference path="../_ref.d.ts" />

'use strict';

import ExposeContext = require('./ExposeContext');

interface ExposeHook {
	(ctx: ExposeContext):any;
}

export = ExposeHook;
