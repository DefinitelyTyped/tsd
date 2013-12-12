/// <reference path='../../xm/Logger.ts' />
/// <reference path='../../xm/Logger.ts' />
/// <reference path='../../_ref.d.ts' />
/// <reference path='Const.ts' />

module tsd {
	'use strict';

	var path = require('path');

	//sourced paths from npm and its dependencies (osenv/osenv.js, npmconf/config-defs.js)
	export class Paths {

		configFile:string;
		cacheDir:string;
		startCwd:string;

		constructor() {
			this.startCwd = path.resolve(process.cwd());
			this.configFile = path.resolve(this.startCwd, tsd.Const.configFile);
			this.cacheDir = path.resolve(this.startCwd, tsd.Const.cacheDir);
		}

		static getCacheDirName():string {
			return (process.platform === 'win32' ? Const.cacheDir : '.' + Const.cacheDir);
		}

		static getUserHome():string {
			return (process.env.HOME || process.env.USERPROFILE);
		}

		static getUserCacheRoot():string {
			return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
		}

		static getUserCacheDir():string {
			return path.resolve(Paths.getUserCacheRoot(), Paths.getCacheDirName());
		}
	}
}
