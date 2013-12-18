/// <reference path="bootstrap.ts" />
/// <reference path="_ref.d.ts" />
/// <reference path="tsd/_ref.ts" />
/// <reference path="tsd/API.ts" />
/// <reference path="tsd/CLI.ts" />

module tsd {
	export function getAPI (configPath:string, verbose:boolean = false):tsd.API {
		xm.assertVar(configPath, 'string', 'configPath');
		return new tsd.API(new tsd.Context(configPath, verbose));
	}
}

module.exports = tsd;
