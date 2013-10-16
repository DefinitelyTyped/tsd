///<reference path="../../../globals.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/xm/io/hash.ts" />
///<reference path="../../../../src/xm/io/FileUtil.ts" />

///<reference path="../../../../src/tsd/data/Def.ts" />
///<reference path="../../../../src/tsd/select/Selector.ts" />
///<reference path="../../../../src/tsd/select/NameMatcher.ts" />

describe('Def', () => {
	'use strict';

	var path = require('path');
	var assert:Chai.Assert = require('chai').assert;

	describe('basics', () => {
		it('is defined', () => {
			assert.isFunction(tsd.Def, 'Def');
		});
	});


	before(() => {

	});
	after(() => {
	});

	function assertDef(path:string, expectMatch:boolean = true) {
		assert.isString(path, 'path');
		if (expectMatch) {
			assert(tsd.Def.isDefPath(path), 'expected "' + path + '" to be a Def path');
		}
		else {
			assert(!tsd.Def.isDefPath(path), 'expected "' + path + '" to not be a Def path');
		}
	}
	describe('isDef', () => {

		var data = {
			'a/a.d.ts': true,
			'aa/aa.d.ts': true,
			'a/aa.d.ts': true,
			'a/b-b-b-b-b-b-b.d.ts': true,
			'a/a-a_a-a.d.ts': true,
			'a-a/a-a.d.ts': true,
			'_a/a.d.ts': false,
			'a_/a.d.ts': false,

			'aa/aa.1.0.0.d.ts': true,
			'aa/aa-v1.0.0.d.ts': true,

			'amplifyjs/amplifyjs-tests.ts': false,
			'azure-mobile-services-client/AzureMobileServicesClient-tests.ts': false,
		};

		xm.eachProp(data, (expect, path) => {
			it('test "' + path + '"', () => {
				assertDef(path, expect);
			});
		});
	});
});
