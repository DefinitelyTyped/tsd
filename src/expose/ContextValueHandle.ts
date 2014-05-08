/// <reference path="../_ref.d.ts" />

import Context = require('./Context');

interface ContextValueHandle {
	(value: any, ctx: Context):void;
}
export = ContextValueHandle;
