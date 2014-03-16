/// <reference path="../_ref.d.ts" />

import path = require('path');

import Const = require('./Const');

// sourced paths from npm and its dependencies (osenv/osenv.js, npmconf/config-defs.js)
class Paths {

	configFile: string;
	cacheDir: string;
	startCwd: string;

	constructor() {
		this.startCwd = path.resolve(process.cwd());
		this.configFile = path.resolve(this.startCwd, Const.configFile);
		this.cacheDir = path.resolve(this.startCwd, Const.cacheDir);
	}

	static getCacheDirName(): string {
		return (process.platform === 'win32' ? Const.cacheDir : '.' + Const.cacheDir);
	}

	static getUserHome(): string {
		return (process.env.HOME || process.env.USERPROFILE);
	}

	static getUserRoot(): string {
		return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
	}

	static getUserCacheDir(): string {
		return path.resolve(Paths.getUserRoot(), Paths.getCacheDirName());
	}
}

export = Paths;
