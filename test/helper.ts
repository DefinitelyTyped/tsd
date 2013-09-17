///<reference path="_ref.ts" />
///<reference path="../src/xm/io/FileUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />
///<reference path="../src/xm/data/PackageJSON.ts" />
///<reference path="../src/tsd/context/Const.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	export function getCacheDir():string {
		return path.join(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
	}

	export function getContext() {
		var context:tsd.Context;
		context = new tsd.Context();
		context.paths.cacheDir = getCacheDir();
		return context;
	}

	export function dump(object:any, label?:string, depth?:number = 6, showHidden?:bool = false):any{
		if (typeof label !== 'undefined') {
			console.log(label + ':');
		}
		console.log(util.inspect(object, showHidden, depth, true));
	}

	export function dumpJSON(object:any, label?:string):any{
		if (typeof label !== 'undefined') {
			console.log(label + ':');
		}
		console.log(JSON.stringify(object, null, 4));
	}
}