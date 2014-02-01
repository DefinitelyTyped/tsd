describe('tsd', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.use(require('chai-fs'));
	chai.Assertion.includeStack = true;
	var assert = chai.assert;

	describe('package.json', function () {

		var pkg;
		it('valid formed', function () {
			assert.jsonFile('package.json');

			pkg = grunt.file.readJSON('package.json');
			assert.isObject(pkg, 'pkg');
		});
		describe('api module', function () {
			it('is defined', function () {
				assert.property(pkg, 'main', 'pkg.main');
				assert.isFile(pkg.main, 'pkg.main');
			});
		});
		describe('cli module', function () {
			it('cli module', function () {
				assert.property(pkg, 'bin', 'pkg.bin');
				assert.property(pkg.bin, 'tsd', 'pkg.bin');
				assert.isFile(pkg.bin.tsd, 'pkg.bin.tsd');
			});
		});
	});
});
