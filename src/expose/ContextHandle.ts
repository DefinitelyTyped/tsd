/// <reference path="../_ref.d.ts" />

'use strict';

import Context = require('./Context');

interface ContextHandle {
	(ctx: Context):any;
}

export = ContextHandle;
