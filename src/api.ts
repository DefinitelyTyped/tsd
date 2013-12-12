/// <reference path="bootstrap.ts" />
/// <reference path="_ref.d.ts" />
/// <reference path="tsd/_ref.ts" />
/// <reference path="tsd/API.ts" />
/// <reference path="tsd/CLI.ts" />

//TODO decide on export git + xm (no)
//TODO improve code (nice TS 0.9 single export)
(module).exports = {
	tsd: tsd,
	//xm: xm,
	//git: git,
	runARGV: tsd.runARGV,
	// move to API?
	getAPI: function (configPath:string, verbose:boolean = false):tsd.API {
		xm.assertVar(configPath, 'string', 'configPath');
		return new tsd.API(new tsd.Context(configPath, verbose));
	}
};
