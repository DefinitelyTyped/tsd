describe('minitable', function () {
	'use strict';

	var grunt = require('grunt');
	var chai = require('chai');
	chai.Assertion.includeStack = true;
	var assert = chai.assert;


	var miniwrite = require('miniwrite');
	var ministyle = require('ministyle');
	var minitable = require('../../lib/minitable/minitable');

	var builder;
	var chain;
	var multi;

	afterEach(function () {
		builder = null;
		chain = null;
		multi = null;
	});

	describe('table', function () {
		beforeEach(function () {
			builder = minitable.getBuilder();
			assert.isObject(builder);
		});
	});
});
