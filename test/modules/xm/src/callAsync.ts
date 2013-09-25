///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/callAsync.ts" />

describe('xm.callAsync', () => {

	it('should call next event loop', (done) => {
		var variable = 0;

		function test(valueA, valueB) {
			assert.strictEqual(valueA, 1, 'async valueA');
			assert.strictEqual(valueB, 2, 'async valueB');
			assert.lengthOf(arguments, 2, 'arguments');

			variable += valueA;
			assert.strictEqual(variable, 1, 'async variable');
			done();
		}

		xm.callAsync(test, 1, 2);
		assert.strictEqual(variable, 0, 'sync');
	});
});
