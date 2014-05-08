'use strict';

require('./bootstrap');

import API = require('./tsd/API');
import Context = require('./tsd/context/Context');
import assertVar = require('./xm/assertVar');

export function getAPI(configPath: string, verbose: boolean = false): API {
	assertVar(configPath, 'string', 'configPath');
	return new API(new Context(configPath, verbose));
}
