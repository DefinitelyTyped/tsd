/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/xm/date.ts" />

describe('xm.date', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	it('toNiceUTC() should return a nicely formatted string', () => {
		var date = new Date(Date.parse('Thu Sep 19 2013 17:35:12 GMT+0200'));
		var expected = '2013-09-19 15:35';
		assert.strictEqual(xm.date.toNiceUTC(date), expected);
	});

	it('isEqualDate()', () => {
		var actual = new Date('2000-10-10 10:00');
		var expected = new Date('2000-10-10 10:00');
		assert.isTrue(xm.date.isEqualDate(actual, expected));
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
		].forEach((pair:string[]) => {
			it(pair[0] + ' vs ' + pair[1], () => {
				var before = new Date(pair[0]);
				var after = new Date(pair[1]);

				assert.isTrue(xm.date.isBeforeDate(before, after), 'isBeforeDate');
				assert.isTrue(xm.date.isAfterDate(after, before), 'isAfterDate');

				assert.isFalse(xm.date.isBeforeDate(after, before), 'not isBeforeDate');
				assert.isFalse(xm.date.isAfterDate(before, after), 'not isAfterDate');

				assert.isFalse(xm.date.isEqualDate(before, after), 'not isEqualDate');
			});
		});
	});
});
