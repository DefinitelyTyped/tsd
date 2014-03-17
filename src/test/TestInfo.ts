/// <reference path="_ref.d.ts" />

import fs = require('fs');
import util = require('util');
import path = require('path');
import assertVar = require('../xm/assertVar');
import fileIO = require('../xm/file/fileIO');
import Const = require('../tsd/context/Const');
import Paths = require('../tsd/context/Paths');
import Helper = require('./Helper');

class TestInfo {

	name: string;
	group: string;

	tmpDir: string;
	dumpDir: string;

	fixturesDir: string;
	modBuildDir: string;

	helper: Helper;

	constructor(helper: Helper, group: string, name: string, test: any, createConfigFile: boolean = true) {
		assertVar(group, 'string', 'group');
		assertVar(name, 'string', 'name');
		assertVar(test, 'object', 'test');

		this.name = name;
		this.group = group;

		this.tmpDir = path.join(__dirname, 'result', this.group, this.name);
		this.dumpDir = path.resolve(this.tmpDir, 'dump');
		this.fixturesDir = path.resolve(__dirname, '..', 'fixtures', 'expected', this.group, this.name);
		this.modBuildDir = path.resolve(__dirname, '..', '..', '..', '..', 'build');

		if (test.fixtures) {
			this.fixturesDir = path.resolve(this.fixturesDir, '..', test.fixtures);
		}

		fileIO.mkdirCheckSync(this.tmpDir, true);
		fileIO.mkdirCheckSync(this.modBuildDir, true);

		if (createConfigFile) {
			fs.writeFileSync(this.configFile, fs.readFileSync('./test/fixtures/config/default.json', {encoding: 'utf8'}), {encoding: 'utf8'});
		}
	}

	get cacheDirTestFixed(): string {
		return this.helper.getFixedCacheDir();
	}

	get typingsDir(): string {
		return path.join(this.tmpDir, 'typings');
	}

	get cacheDirDev(): string {
		return path.join(this.helper.getProjectRoot(), Const.cacheDir);
	}

	get cacheDirUser(): string {
		return Paths.getUserCacheDir();
	}

	get configFile(): string {
		return path.join(this.tmpDir, Const.configFile);
	}

	get resultFile(): string {
		return path.join(this.tmpDir, 'result.json');
	}

	get errorFile(): string {
		return path.join(this.tmpDir, 'error.json');
	}

	get stdoutFile(): string {
		return path.join(this.tmpDir, 'stdout.txt');
	}

	get stderrFile(): string {
		return path.join(this.tmpDir, 'stderr.txt');
	}

	get configExpect(): string {
		return path.join(this.fixturesDir, Const.configFile);
	}

	get resultExpect(): string {
		return path.join(this.fixturesDir, 'result.json');
	}

	get errorExpect(): string {
		return path.join(this.fixturesDir, 'error.json');
	}

	get stdoutExpect(): string {
		return path.join(this.fixturesDir, 'stdout.txt');
	}

	get stderrExpect(): string {
		return path.join(this.fixturesDir, 'stderr.txt');
	}

	get typingsExpect(): string {
		return path.join(this.fixturesDir, 'typings');
	}

	get testDump(): string {
		return path.join(this.dumpDir, 'test.json');
	}

	get argsDump(): string {
		return path.join(this.dumpDir, 'args.json');
	}

	get queryDump(): string {
		return path.join(this.dumpDir, 'query.json');
	}

	get optionsDump(): string {
		return path.join(this.dumpDir, 'options.json');
	}

	get modBuildAPI(): string {
		return path.join(this.modBuildDir, 'api.js');
	}

	get modBuildCLI(): string {
		return path.join(this.modBuildDir, 'cli.js');
	}
}

export = TestInfo;
