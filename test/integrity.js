describe('tsd', function () {

	var grunt = require('grunt');
	var chai = require('chai');
	chai.use(require('chai-fs'));
	chai.Assertion.includeStack = true;
	var assert = chai.assert;

	var pkg;

	it('validly formed package.json', function () {
		assert.jsonFile('package.json');

		pkg = grunt.file.readJSON('package.json');
		assert.isObject(pkg, 'pkg');
	});
	it('api module is linked in package.json', function () {
		assert.isObject(pkg, 'pkg');

		assert.property(pkg, 'main', 'pkg.main');
		assert.property(pkg.main, 'tsd', 'pkg.main');
		assert.isFile(pkg.main.tsd, 'pkg.main');
	});
	it('cli module is linked in package.json', function () {
		assert.isObject(pkg, 'pkg');

		assert.property(pkg, 'bin', 'pkg.bin');
		assert.property(pkg.bin, 'tsd', 'pkg.bin');
		assert.isFile(pkg.bin.tsd, 'pkg.bin');
	});
});