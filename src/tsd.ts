///<reference path="_ref.ts" />
///<reference path="tsd/_ref.ts" />
///<reference path="xm/io/Expose.ts" />

module tsd {

	var exp:any = {tsd: tsd, xm: xm};
	exports = (module).exports = exp;

	var isMain = (module) && require.main === (module);

	if (isMain || process.env['tsd-expose']) {

		var fs = require('fs');
		var path = require('path');
		var util = require('util');
		var async:Async = require('async');

		//expose some easy access tools to cli
		var expose = new xm.Expose();

		expose.add('info', (args:any) =>{

		}, 'print tool info');

		//run command
		if (isMain) {
			expose.execute('info');
			var argv = require('optimist').argv;
			//run it
			expose.executeArgv(argv, 'info');
		}
	}
}
