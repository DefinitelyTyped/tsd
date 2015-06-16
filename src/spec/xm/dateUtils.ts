/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import dateUtils = require('../../xm/dateUtils');

describe('dateUtils', () => {
	it('toNiceUTC() should return a nicely formatted string', () => {
		var date = new Date(Date.parse('Thu Sep 19 2013 17:35:12 GMT+0200'));
		var expected = '2013-09-19 15:35';
		assert.strictEqual(dateUtils.toNiceUTC(date), expected);
	});
	it('isEqualDate()', () => {
		var actual = new Date('2000-10-10 10:00');
		var expected = new Date('2000-10-10 10:00');
		assert.isTrue(dateUtils.isEqualDate(actual, expected));
	});
	describe('isBefore / isAfter', () => {
		[
			[
				'2000-10-10 10:00',
				'2020-10-10 10:00'
			],
			[
				'2000-10-10 10:00',
				'2000-12-10 10:00'
			],
			[
				'2000-10-10 10:00',
				'2010-10-20 10:00'
			]
		].forEach((pair: string[]) => {
			it(pair[0] + ' vs ' + pair[1], () => {
				var before = new Date(pair[0]);
				var after = new Date(pair[1]);

				assert.isTrue(dateUtils.isBeforeDate(before, after), 'isBeforeDate');
				assert.isTrue(dateUtils.isAfterDate(after, before), 'isAfterDate');

				assert.isFalse(dateUtils.isBeforeDate(after, before), 'not isBeforeDate');
				assert.isFalse(dateUtils.isAfterDate(before, after), 'not isAfterDate');

				assert.isFalse(dateUtils.isEqualDate(before, after), 'not isEqualDate');
			});
		});
	});
});
