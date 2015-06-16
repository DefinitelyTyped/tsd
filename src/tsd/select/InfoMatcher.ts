/// <reference path="../_ref.d.ts" />

'use strict';

import DefVersion = require('../data/DefVersion');

/*
 InfoMatcher: test against DefInfo
 */
// TODO implement InfoMatcher
class InfoMatcher {
	filter(list: DefVersion[]): DefVersion[] {
		return list;
	}
}

export = InfoMatcher;
