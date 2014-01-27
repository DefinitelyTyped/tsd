/// <reference path="../_ref.ts" />
/// <reference path="../../xm/expose/Expose.ts" />

module tsd {
	'use strict';

	export module cli {

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
			export var overwrite = 'overwrite';
			export var min = 'min';
			export var max = 'max';
			export var limit = 'limit';
			export var timeout = 'timeout';
			export var commit = 'commit';
			export var semver = 'semver';
			export var date = 'date';
			export var progress = 'progress';


			export var action = 'action';
			export var info = 'info';
			export var history = 'history';
			export var detail = 'detail';
			export var allowUpdate = 'allowUpdate';s
		}
		xm.object.lockPrimitives(Opt);

		export module Group {
			export var primary = 'primary';
			export var query = 'query';
			export var support = 'support';
			export var help = 'help';
		}
		xm.object.lockPrimitives(Group);

		export module Action {
			export var install = 'install';
			export var open = 'open';
			export var compare = 'compare';
			export var update = 'update';
		}
		xm.object.lockPrimitives(Action);
	}
}
