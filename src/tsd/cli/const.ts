///<reference path="../_ref.ts" />
///<reference path="../../xm/io/Expose.ts" />

module tsd {

	export module cli {

		export module Opt {
			export var version = 'version';
			export var verbose = 'verbose';
			export var color = 'color';
			export var dev = 'dev';
			export var config = 'config';
			export var cacheDir = 'cacheDir';
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
		}
		xm.ObjectUtil.lockPrimitives(Opt);

		export module Group {
			export var query = 'query';
			export var support = 'support';
			export var help = 'help';
		}
		xm.ObjectUtil.lockPrimitives(Group);
	}
}
