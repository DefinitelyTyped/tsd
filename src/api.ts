/// <reference path="_ref.d.ts" />

'use strict';

import bootstrap = require('./bootstrap');

import API = require('./tsd/API');
import assertVar = require('./xm/assertVar');

export import Context = require('./tsd/context/Context');
export import Options = require('./tsd/Options');
export import Query = require('./tsd/select/Query');

export import CommitMatcher = require('./tsd/select/CommitMatcher');
export import DateMatcher = require('./tsd/select/DateMatcher');
export import InfoMatcher = require('./tsd/select/InfoMatcher');
export import VersionMatcher = require('./tsd/select/VersionMatcher');

export import defUtil = require('./tsd/util/defUtil');
export import getContent = require('./getContent');

export function getAPI(configPath: string, verbose: boolean = false): API {
	assertVar(configPath, 'string', 'configPath');
	return new API(new Context(configPath, verbose));
}

// haxx compiler emit bug
[
	bootstrap,
	getContent,
	Options,
	Query,
	Context,
	CommitMatcher,
	DateMatcher,
	InfoMatcher,
	VersionMatcher,
	defUtil
];
