///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/DateUtil.ts" />

describe('xm.DateUtil', () => {

	it('toNiceUTC() should return a nicely formatted string', () => {
		var date = new Date(Date.parse('Thu Sep 19 2013 17:35:12 GMT+0200 (West-Europa (zomertijd))'));
		var expected = '2013-09-19 15:35';
		assert.strictEqual(xm.DateUtil.toNiceUTC(date), expected);
	});
});