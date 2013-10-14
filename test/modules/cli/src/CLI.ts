///<reference path="../../../globals.ts" />
///<reference path="../../../tsdHelper.ts" />

describe('CLI Query', () => {
	'use strict';

	var fs = require('fs');
	var path = require('path');
	var FS = require('q-io/fs');
	var assert:Chai.Assert = require('chai').assert;

	function applyTestInfo(group:string, name:string, test:any, createConfigFile:boolean = false):helper.TestInfo {
		var info = helper.getTestInfo(group, name, createConfigFile);

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

		if (test.selector && test.selector.pattern) {
			args.push(test.selector.pattern);
		}
		args.push('--config', info.configFile);

		//TODO also write a .bat/.cmd and a shell script; with absolute paths etc for re-run
		xm.FileUtil.writeJSONSync(info.argsDump, {list: args, flat: args.join(' ')});

		return args;
	}

	function assertResult(result:helper.RunCLIResult, test, info:helper.TestInfo, args):void {
		assert.isObject(result, 'result');
		assert.strictEqual(result.code, 0, 'result.code');
		assert.operator(result.stdout.length, '>=', 0, 'result.stdout.length');

		fs.writeFileSync(info.stdoutFile, result.stdout);
		if (result.stderr.length > 0) {
			fs.writeFileSync(info.stderrFile, result.stderr);
		}
		if (result.error) {
			fs.writeFileSync(info.errorFile, result.error);
		}

		var stdoutExpect = fs.readFileSync(info.stdoutExpect);
		assert.operator(stdoutExpect.length, '>=', 0, 'stdoutExpect.length');
		//TODO find out how to compare cli output (what is the real encoding? how to get string diff?)
		helper.assertBufferEqual(result.stdout, stdoutExpect, 'result.stdout');

		if (fs.existsSync(info.stderrExpect)) {
			var stderrExpect = xm.FileUtil.readJSONSync(info.stderrExpect);
			helper.assertBufferEqual(result.stderr, stderrExpect, 'result.stderr');
		}

		if (fs.existsSync(info.errorExpect)) {
			var errorExpect = xm.FileUtil.readJSONSync(info.errorExpect);
			assert.jsonOf(result.error, errorExpect, 'result.error');
		}
	}

	describe('help', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'help'));

		xm.eachProp(data.tests, function (test, name) {
			if (data.skip) {
				return;
			}

			it.promised('test "' + name + '"', () => {
				var info = applyTestInfo('help', name, test);
				var args = getArgs(test, data, info);

				return helper.runCLI(info.modBuildCLI, args).then((result:helper.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertResult(result, test, info, args);
				});
			});
		});
	});

	describe('search', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'search'));

		xm.eachProp(data.tests, function (test, name) {
			if (data.skip) {
				return;
			}

			it.promised('test "' + name + '"', () => {
				var info = applyTestInfo('search', name, data);
				var args = getArgs(test, data, info);

				return helper.runCLI(info.modBuildCLI, args).then((result:helper.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertResult(result, test, info, args);
				});
			});
		});
	});
});
