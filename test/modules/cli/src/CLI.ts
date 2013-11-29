///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />

describe('CLI Query', () => {
	'use strict';

	var fs = require('fs');
	var FS = require('q-io/fs');
	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	function applyTestInfo(group:string, name:string, test:any, createConfigFile:boolean = false):helper.TestInfo {
		var info = helper.getTestInfo(group, name, test, createConfigFile);

		xm.FileUtil.writeJSONSync(info.testDump, test);

		return info;
	}

	function getArgs(test, data, info:helper.TestInfo):string[] {
		assert.isObject(test, 'test');
		assert.isObject(data, 'data');
		assert.instanceOf(info, helper.TestInfo, 'info');

		var args:string[] = [];

		if (test.command) {
			assert.isArray(test.command, 'test.command');
			args.push.apply(args, test.command);
		}
		else if (data.command) {
			assert.isArray(data.command, 'data.command');
			args.push.apply(args, data.command);
		}

		if (test.query) {
			if (test.query.pattern) {
				args.push(test.query.pattern);
			}
			if (test.query.overwrite) {
				args.push('--overwrite');
			}
			if (test.query.resolve) {
				args.push('--resolve');
			}
			if (test.query.save) {
				args.push('--save');
			}
		}

		if (test.color) {
			args.push('--color', test.color);
		}
		else {
			args.push('--color', 'no');
		}
		args.push('--cacheDir', info.cacheDirTestFixed);
		//args.push('--config', info.configFile);

		//TODO also write a .bat/.cmd and a shell script; with absolute paths etc (for lazy re-run)
		xm.FileUtil.writeJSONSync(info.argsDump, {list: args, flat: args.join(' ')});

		return args;
	}

	var trimHeaderExp = /^[.\s]*?(-> tsd.*)\s+?-*\s*/;

	function trimHeader(str:string):string {
		return str.replace(trimHeaderExp, '');
	}

	function assertCLIResult(result:helper.RunCLIResult, test, info:helper.TestInfo, args):void {
		assert.isObject(result, 'result');
		assert.strictEqual(result.code, 0, 'result.code');
		assert.operator(result.stdout.length, '>=', 0, 'result.stdout.length');

		var stdout = trimHeader(result.stdout.toString('utf8'));
		var stderr = trimHeader(result.stderr.toString('utf8'));

		fs.writeFileSync(info.stdoutFile, stdout, 'utf8');
		if (result.stderr.length > 0) {
			fs.writeFileSync(info.stderrFile, stderr, 'utf8');
		}
		if (result.error) {
			xm.FileUtil.writeJSONSync(info.errorFile, result.error);
		}

		var stdoutExpect = fs.readFileSync(info.stdoutExpect, 'utf8');
		assert.operator(stdoutExpect.length, '>=', 0, 'stdoutExpect.length');

		assert.strictEqual(stdout, stdoutExpect, 'result.stdout');

		if (fs.existsSync(info.stderrExpect)) {
			var stderrExpect = fs.readFileSync(info.stderrExpect, 'utf8');
			assert.strictEqual(stderr, stderrExpect, 'result.stderr');
		}
		if (fs.existsSync(info.errorExpect)) {
			var errorExpect = xm.FileUtil.readJSONSync(info.errorExpect);
			assert.jsonOf(result.error, errorExpect, 'result.error');
		}
	}

	describe('help', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'help'));

		xm.eachProp(data.tests, (test, name) => {
			var debug = test.debug;
			if (test.skip) {
				return;
			}

			it.eventually('test "' + name + '"', () => {
				var info = applyTestInfo('help', name, test);
				var args = getArgs(test, data, info);

				return helper.runCLI(info.modBuildCLI, args, debug).then((result:helper.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertCLIResult(result, test, info, args);
				});
			});
		});
	});

	describe('query', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'query'));

		xm.eachProp(data.tests, (test, name) => {
			var debug = test.debug;
			if (test.skip) {
				return;
			}

			it.eventually('test "' + name + '"', () => {
				var info = applyTestInfo('query', name, data);
				var args = getArgs(test, data, info);

				return helper.runCLI(info.modBuildCLI, args, debug).then((result:helper.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertCLIResult(result, test, info, args);
				});
			});
		});
	});
});
