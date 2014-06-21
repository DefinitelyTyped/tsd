/// <reference path="../../_ref.d.ts" />

'use strict';

import fs = require('fs');
import path = require('path');
import Promise = require('bluebird');

import chai = require('chai');
var assert = chai.assert;

import CacheMode = require('../../http/CacheMode');
import fileIO = require('../../xm/fileIO');
import cp = require('../../xm/lib/childProcess');
import runCLI = cp.runCLI;

import helper = require('../../test/helper');
import settings = require('../../test/settings');
import TestInfo = require('../../test/TestInfo');

describe('CLI Query', () => {

	function applyTestInfo(group: string, name: string, test: any, createConfigFile: boolean = false): TestInfo {
		var info = new TestInfo(group, name, test, createConfigFile);

		fileIO.writeJSONSync(info.testDump, test);

		return info;
	}

	function getArgs(test, data, info: TestInfo): string[] {
		assert.isObject(test, 'test');
		assert.isObject(data, 'data');
		assert.instanceOf(info, TestInfo, 'info');

		var args: string[] = [];

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

		if (test.style) {
			args.push('--style', test.style);
		}
		else {
			args.push('--style', 'plain');
		}

		args.push('--progress', 'no');
		args.push('--services', 'no');
		args.push('--cacheMode', CacheMode[settings.apiCache]);

		args.push('--cacheDir', info.cacheDirTestFixed);
		args.push('--config', path.resolve('./test/fixtures/config/default.json'));

		// TODO also write a .bat/.cmd and a shell script; with absolute paths etc (for lazy re-run)
		fileIO.writeJSONSync(info.argsDump, {list: args, flat: args.join(' ')});

		return args;
	}

	var trimHeaderExp = /^\s*?(>> tsd) (\d+\.\d+\.\d+)(\S+)?([ \S]*(?:\r?\n)+)/;

	function trimHeader(str: string): string {
		return str.replace(trimHeaderExp, '');
	}

	function assertCLIResult(result: cp.RunCLIResult, test, info: TestInfo, args): void {
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
			fileIO.writeJSONSync(info.errorFile, result.error);
		}

		var stdoutExpect = fs.readFileSync(info.stdoutExpect, 'utf8');
		assert.operator(stdoutExpect.length, '>=', 0, 'stdoutExpect.length');

		helper.longAssert(stdout, stdoutExpect, 'result.stdout');

		if (fs.existsSync(info.stderrExpect)) {
			var stderrExpect = fs.readFileSync(info.stderrExpect, 'utf8');
			helper.longAssert(stderr, stderrExpect, 'result.stderr');
		}
		if (fs.existsSync(info.errorExpect)) {
			var errorExpect = fileIO.readJSONSync(info.errorExpect);
			assert.jsonOf(result.error, errorExpect, 'result.error');
		}
	}

	describe('help', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'help'));

		Object.keys(data.tests).forEach((name) => {
			var test = data.tests[name];
			var debug = test.debug;
			if (test.skip) {
				return;
			}

			it('test "' + name + '"', () => {
				var info = applyTestInfo('help', name, test);
				var args = getArgs(test, data, info);

				return runCLI(info.modBuildCLI, args, debug).then((result: cp.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertCLIResult(result, test, info, args);
				});
			});
		});
	});

	describe('query', () => {
		var data = require(path.join(helper.getDirNameFixtures(), 'query'));

		Object.keys(data.tests).forEach((name) => {
			var test = data.tests[name];
			var debug = test.debug;
			if (test.skip) {
				return;
			}

			it('test "' + name + '"', () => {
				var info = applyTestInfo('query', name, data);
				var args = getArgs(test, data, info);

				return runCLI(info.modBuildCLI, args, debug).then((result: cp.RunCLIResult) => {
					assert.isObject(result, 'result');
					assert.notOk(result.error, 'result.error');

					assertCLIResult(result, test, info, args);
				});
			});
		});
	});
});
