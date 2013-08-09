///<reference path="../_ref.ts" />
///<reference path="../../src/xm/io/hash.ts" />

describe('xm.hash', function () {

	describe('sha1()', () => {
		it('should return correct hash', () => {
			var hash = xm.sha1('foo bar');
			var expected = '3773dea65156909838fa6c22825cafe090ff8030';
			assert.strictEqual(hash, expected, 'preset');
			assert.strictEqual(hash, xm.sha1('foo bar'), 'repeatable');
		});
	});
	describe('md5()', () => {
		it('should return correct hash', () => {
			var hash = xm.md5('foo bar');
			var expected = '327b6f07435811239bc47e1544353273';
			assert.strictEqual(hash, expected, 'preset');
			assert.strictEqual(hash, xm.md5('foo bar'), 'repeatable');
		});
	})
	describe('jsonToIdent()', () => {
		describe('objects', () => {
			var valueA = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};
			var valueB = {c: [1, 2, 3], d: {b: 'bravo', a: 11, c: [11, 22, 33]}, a: 1, b: 'B'};

			var valueX1 = {a: 2, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};
			var valueX2 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'nope', c: [11, 22, 33]}};
			var valueX3 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22]}};
			var valueX4 = {a: 1, b: 'XX', c: [3, 2, 1], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};
			var valueX5 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo'}};

			it('should return identical hash for same object', () => {
				var ori = xm.jsonToIdent(valueA);
				var alt = xm.jsonToIdent(valueA);
				assert.isString(ori, 'ori');
				assert.isString(alt, 'alt');
				assert.strictEqual(ori, alt);
			});
			it('should return identical hash for reordered data', () => {
				var ori = xm.jsonToIdent(valueA);
				var alt = xm.jsonToIdent(valueB);
				assert.strictEqual(ori, alt);
			});
			it('should return different hash for different data', () => {
				var ori = xm.jsonToIdent(valueA);
				var alt;
				alt = xm.jsonToIdent(valueX1);
				assert.notStrictEqual(ori, alt, 'valueA -> valueX1');
				alt =  xm.jsonToIdent(valueX2)
				assert.notStrictEqual(ori, alt, 'valueA -> valueX2');
				alt =  xm.jsonToIdent(valueX3)
				assert.notStrictEqual(ori, alt, 'valueA -> valueX3');
				alt =  xm.jsonToIdent(valueX4)
				assert.notStrictEqual(ori, alt, 'valueA -> valueX4');
				alt =  xm.jsonToIdent(valueX5)
				assert.notStrictEqual(ori, alt, 'valueA -> valueX5');
			});
			it('should throw on Function', () => {
				assert.throws(() => {
					console.log(xm.jsonToIdent({a:1, b:function(x){
						return x * x;
					}}));
				});
			});
			it('should throw on RegExp', () => {
				assert.throws(() => {
					console.log(xm.jsonToIdent({a:1, b:/^[0-9]+$/}));
				});
			});
			it('should serialise Date, include millisecond level', () => {
				var valueA = new Date();
				var ori = xm.jsonToIdent(valueA);
				var alt = xm.jsonToIdent(new Date(valueA.getTime()));
				assert.strictEqual(ori, alt, 'identical values');
				alt = xm.jsonToIdent(new Date(valueA.getTime() + 2));
				assert.notStrictEqual(ori, alt, 'milli second');
			});
		});
	});
});
