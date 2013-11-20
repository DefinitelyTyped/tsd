///<reference path="../../../globals.ts" />
///<reference path="../../../../src/tsd/select/Query.ts" />
///<reference path="../../../../src/xm/hash.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

///<reference path="../../../../src/tsd/data/Def.ts" />
///<reference path="../../../../src/tsd/select/Query.ts" />
///<reference path="../../../../src/tsd/select/NameMatcher.ts" />

describe('Def', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	function assertIsDef(path:string, expectMatch:boolean = true) {
		assert.isString(path, 'path');
		if (expectMatch) {
			assert(tsd.Def.isDefPath(path), 'expected "' + path + '" to be a Def path');

			//double check
			var def = tsd.Def.getFrom(path);
			assert.instanceOf(def, tsd.Def);
		}
		else {
			assert(!tsd.Def.isDefPath(path), 'expected "' + path + '" to not be a Def path');
		}
	}

	function assertDefFrom(path:string, fields:any, trim:boolean) {
		assert.isString(path, 'path');
		assert.isObject(fields, 'fields');

		var def = tsd.Def.getFrom(path, trim);
		assert.isObject(def, 'def');
		assert.strictEqual(def.project, fields.project, 'def.project');
		assert.strictEqual(def.name, fields.name, 'def.name');

		if (fields.semver) {
			assert.strictEqual(def.semver, fields.semver, 'def.semver');
		}
		else {
			assert.notOk(def.semver, 'def.semver');
		}
	}

	describe('basics', () => {
		it('is defined', () => {
			assert.isFunction(tsd.Def, 'Def');
		});
	});

	describe('isDef', () => {
		var data:any = xm.FileUtil.readJSONSync(path.resolve(__dirname, '..', 'fixtures', 'is-path.json'));
		after(() => {
			data = null;
		});

		xm.eachProp(data, (group, label) => {
			describe(label, () => {
				xm.eachProp(group, (expect, path) => {
					it((expect ? 'pass' : 'fail') + ' "' + path + '"', () => {
						assertIsDef(path, expect);
					});
				});
			});
		});
	});

	describe('getFrom', () => {
		var data:any = xm.FileUtil.readJSONSync(path.resolve(__dirname, '..', 'fixtures', 'parse-path.json'));
		after(() => {
			data = null;
		});

		xm.eachProp(data, (group, label) => {
			describe(label, () => {
				xm.eachProp(group, (fields, path) => {
					it('test "' + path + '"', () => {
						assertDefFrom(path, fields, false);
					});
				});
			});
		});
	});

	describe('getFrom trimmed', () => {
		var data:any = xm.FileUtil.readJSONSync(path.resolve(__dirname, '..', 'fixtures', 'parse-path-trim.json'));
		after(() => {
			data = null;
		});

		xm.eachProp(data, (group, label) => {
			describe(label, () => {
				xm.eachProp(group, (fields, path) => {
					it('test "' + path + '"', () => {
						assertDefFrom(path, fields, true);
					});
				});
			});
		});
	});
});
