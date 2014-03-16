/// <reference path="./_ref.d.ts" />

import typeOf = require('../xm/typeOf');
import assertVar = require('../xm/assertVar');
/*
 Options: bundles options
 */
class Options {

	minMatches: number = 0;
	maxMatches: number = 0;
	limitApi: number = 5;

	resolveDependencies: boolean = false;
	overwriteFiles: boolean = false;
	saveToConfig: boolean = false;
	addToBundles: string[] = [];

	// TODO implement timeout (limitless powerr!)
	timeout: number = 10000;

	static fromJSON(json: Object): Options {
		var opts = new Options();
		if (json) {
			Object.keys(opts).forEach((key: string) => {
				if (key in json) {
					assertVar(json[key], typeOf.get(opts[key]), 'json[' + key + ']');
					opts[key] = json[key];
				}
			});
		}
		return opts;
	}

	static main = Object.freeze(new Options());
}

export = Options;
