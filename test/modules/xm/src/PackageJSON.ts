///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/data/PackageJSON.ts" />

describe('xm.PackageJSON', () => {
	'use strict';

	var info:xm.PackageJSON;
	it('is defined as function', () => {
		assert.isFunction(xm.PackageJSON);
	});
	describe('local', () => {
		it('should return instance', () => {
			info = xm.PackageJSON.getLocal();
			assert.isObject(info, 'info');
		});
		it('should have properties', () => {
			info = xm.PackageJSON.getLocal();
			assert.isString(info.name, 'name');
			assert.isString(info.version, 'version');
			assert.isObject(info.raw, 'pkg');
		});
	});
	//more in Context
});
