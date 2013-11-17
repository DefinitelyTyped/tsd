describe('tsd', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.use(require('chai-fs'));
	chai.Assertion.includeStack = true;
	var assert = chai.assert;

	describe('package.json', function () {

		var pkg;
		//TODO move it to a json-schema
		it('valid formed', function () {
			assert.jsonFile('package.json');

			pkg = grunt.file.readJSON('package.json');
			assert.isObject(pkg, 'pkg');
		});
		it('api module', function () {
			assert.isObject(pkg, 'pkg');

			assert.property(pkg, 'main', 'pkg.utf8');
			assert.property(pkg.main, 'tsd', 'pkg.main');
			assert.isFile(pkg.main.tsd, 'pkg.main');
		});
		it('cli module', function () {
			assert.isObject(pkg, 'pkg');

			assert.property(pkg, 'bin', 'pkg.bin');
			assert.property(pkg.bin, 'tsd', 'pkg.bin');
			assert.isFile(pkg.bin.tsd, 'pkg.bin');
		});
	});
});
