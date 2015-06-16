/// <reference path="../_ref.d.ts" />

'use strict';

import assertVar = require('../../xm/assertVar');
import objectUtils = require('../../xm/objectUtils');

import Def = require('../data/Def');
import DefVersion = require('../data/DefVersion');

import Query = require('./Query');

class Selection {
	query: Query;
	definitions: Def[];
	selection: DefVersion[];

	error: any;

	constructor(query: Query = null) {
		assertVar(query, Query, 'query', true);
		this.query = query;
	}
}

export = Selection;
