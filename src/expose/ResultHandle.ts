/// <reference path="../_ref.d.ts" />

'use strict';

import Result = require('./Result');

interface ResultHandle {
	(res: Result):any;
}

export = ResultHandle;
