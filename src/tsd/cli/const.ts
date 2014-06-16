/// <reference path="../_ref.d.ts" />

'use strict';

import objectUtils = require('../../xm/objectUtils');

export module Opt {
	export var version = 'version';
	export var verbose = 'verbose';
	export var style = 'style';
	export var dev = 'dev';
	export var config = 'config';
	export var cacheDir = 'cacheDir';
	export var cacheMode = 'cacheMode';
	export var resolve = 'resolve';
	export var save = 'save';
	export var bundle = 'bundle';
	export var overwrite = 'overwrite';
	export var min = 'min';
	export var max = 'max';
	export var limit = 'limit';
	export var commit = 'commit';
	export var semver = 'semver';
	export var date = 'date';
	export var action = 'action';
	export var info = 'info';
	export var history = 'history';
	export var services = 'services';
}
objectUtils.lockPrimitives(Opt);

export module Group {
	export var primary = 'primary';
	export var query = 'query';
	export var support = 'support';
	export var help = 'help';
}
objectUtils.lockPrimitives(Group);

export module Action {
	export var install = 'install';
	export var open = 'open';
	export var browse = 'browse';
	export var visit = 'visit';
	export var compare = 'compare';
	export var update = 'update';
}
objectUtils.lockPrimitives(Action);
