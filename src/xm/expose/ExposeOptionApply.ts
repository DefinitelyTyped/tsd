/// <reference path="../_ref.d.ts" />

import ExposeContext = require('./ExposeContext');

interface ExposeOptionApply {
	(value: any, ctx: ExposeContext):void;
}
export = ExposeOptionApply;
