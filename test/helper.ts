///<reference path="_ref.ts" />
///<reference path="../src/xm/io/FileUtil.ts" />
///<reference path="../src/xm/io/Logger.ts" />

module helper {

	var fs = require('fs');
	var path = require('path');
	var util = require('util');

	require('source-map-support').install();

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