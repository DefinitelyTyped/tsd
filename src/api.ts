///<reference path="_ref.ts" />
///<reference path="tsd/_ref.ts" />
///<reference path="tsd/api_ren.ts" />
///<reference path="tsd/CLI.ts" />

(module).exports = {
	tsd: tsd,
	xm: xm,
	git: git,
	runARGV: tsd.runARGV,
	// move to API?
	getAPI: function (configPath:string, verbose?:bool = false):tsd.API {
		xm.assertVar('configPath', configPath, 'string');
		return new tsd.API(new tsd.Context(configPath, verbose));
	}
};
