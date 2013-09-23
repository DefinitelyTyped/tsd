///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/iterate.ts" />

describe('xm.assertVar', () => {
	describe('optional', () => {
		it('should pass null/undefined on optional', () => {
			xm.assertVar('myVar', undefined, 'string', true);
			xm.assertVar('myVar', null, 'string', true);
		});
	});
	describe('string', () => {
		it('should pass on valid', () => {
			xm.assertVar('myVar', 'aaa', 'string');
			xm.assertVar('myVar', '', 'string');
		});
		it('should fail on invalid', () => {
			assert.throws(() => {
				xm.assertVar('myVar', 123, 'string');
			}, /assertVar\(\) expected "myVar" to be a "string" but got "number": 123/);
		});
	});
	describe('number', () => {
		it('should pass on valid', () => {
			xm.assertVar('myVar', 123, 'number');
		});
		it('should fail on invalid', () => {
			assert.throws(() => {
				xm.assertVar('myVar', 'abc', 'number');
			}, /assertVar\(\) expected "myVar" to be a "number" but got "string": "abc"/);
		});
	});
	describe('regexp', () => {
		it('should pass on valid', () => {
			xm.assertVar('myVar', /123/, 'regexp');
		});
		it('should fail on invalid', () => {
			assert.throws(() => {
				xm.assertVar('myVar', 123, 'regexp');
			}, /assertVar\(\) expected "myVar" to be a "regexp" but got "number": 123/);
		});
	});
	describe('sha1', () => {
		it('should pass on valid', () => {
			xm.assertVar('myVar', '7ef3f65b1be3699db091aaec81ab0b205919a6d0', 'sha1');
		});
		it('should fail on invalid', () => {
			assert.throws(() => {
				xm.assertVar('myVar', 'abc', 'sha1');
			}, /assertVar\(\) expected "myVar" to be a "sha1" but got "string": "abc"/);
		});
	});
	describe('md5', () => {
		it('should pass on valid', () => {
			xm.assertVar('myVar', '80b28dda155a27c42cabd42381dc7670', 'md5');
		});
		it('should fail on invalid', () => {
			assert.throws(() => {
				xm.assertVar('myVar', 'abc', 'md5');
			}, /assertVar\(\) expected "myVar" to be a "md5" but got "string": "abc"/);
		});
	});
	describe('instanceOf', () => {

		function MyType() {
			this.prop = 123;
		}

		function MyOtherType() {
			this.otherProp = 321;
		}

		it('should pass on valid', () => {
			var inst = new MyType();
			xm.assertVar('myVar', inst, MyType);
		});

		it('should fail on invalid', () => {
			var inst = new MyType();
			assert.throws(() => {
				xm.assertVar('myVar', inst, MyOtherType);
			}, /assertVar\(\) expected "myVar" to be instanceof MyOtherType\(\) but is a MyType\(\)/);
		});
	});
});
