///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/DateUtil.ts" />

describe('xm.DateUtil', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	it('toNiceUTC() should return a nicely formatted string', () => {
		var date = new Date(Date.parse('Thu Sep 19 2013 17:35:12 GMT+0200'));
		var expected = '2013-09-19 15:35';
		assert.strictEqual(xm.DateUtil.toNiceUTC(date), expected);
	});
});
