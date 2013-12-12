/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/xm/hash.ts" />
/// <reference path="../../../../src/xm/encode.ts" />

describe('xm.hash', () => {

	var assert:Chai.Assert = require('chai').assert;

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
	});
	describe('jsonToIdent()', () => {

		//TODO document intended differences (it a bit unclear now)

		var valueA = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};

		var valueB = {c: [1, 2, 3], d: {b: 'bravo', a: 11, c: [11, 22, 33]}, a: 1, b: 'B'};

		var valueX1 = {a: 222, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};

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

			alt = xm.jsonToIdent(valueX2);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX2');

			alt = xm.jsonToIdent(valueX3);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX3');

			alt = xm.jsonToIdent(valueX4);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX4');

			alt = xm.jsonToIdent(valueX5);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX5');
		});
		it('should throw on Function', () => {
			assert.throws(() => {
				xm.jsonToIdent({a: 1, b: function (x) {
					return x * x;
				}});
			});
		});
		it('should throw on RegExp', () => {
			assert.throws(() => {
				xm.jsonToIdent({a: 1, b: /^[0-9]+$/});
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

	describe('jsonToIdentHash()', () => {
		it('should return same hash for similar objects', () => {
			var valueA = {a: 1, b: 2, c: 3};
			var valueB = {b: 2, c: 3, a: 1};
			var hashA = xm.jsonToIdentHash(valueA, 16);
			var hashB = xm.jsonToIdentHash(valueB, 16);
			var expected = 'e47fb2071f83fdce';
			assert.lengthOf(hashA, 16, 'hashA');
			assert.lengthOf(hashB, 16, 'hashA');
			assert.isString(hashA, 'hashA');
			assert.isString(hashB, 'hashB');
			assert.strictEqual(hashA, hashB, 'equal');
			assert.strictEqual(hashA, expected, 'preset hash');
		});
	});

	describe('hashNormalines()', () => {

		function assertHashNormalines(label:string, values:string[], match:boolean = true) {
			var len = values.length;
			for (var i = 0; i < len; i++) {
				var valueA = values[i];
				var hashedA = xm.hashNormalines(valueA);
				for (var j = (match ? i : i + 1); j < len; j++) {
					var valueB = values[j];
					var hashedB = xm.hashNormalines(valueB);

					if (match) {
						assert.strictEqual(hashedA, hashedB, 'values: ' + label + ': (' + [i, j, len] + '): ' + xm.wrapIfComplex(valueA) + ' vs ' + xm.wrapIfComplex(valueB));
					}
					else {
						assert.notStrictEqual(hashedA, hashedB, 'values: ' + label + ': (' + [i, j, len] + '): ' + xm.wrapIfComplex(valueA) + ' vs ' + xm.wrapIfComplex(valueB));
					}
				}
			}
		}

		it('should return identical hash for similar single line string', () => {
			var values = [
				'abc',
				'abc'
			];
			assertHashNormalines('abs', values);
		});

		it('should return identical hash for similar multiline string', () => {
			var values = [
				'\na\nb\nc\n',
				'\ra\r\nb\nc\r\n',
				'\r\na\r\nb\r\nc\r\n',
				'\r\n\r\na\r\n\r\n\r\nb\r\nc\r\n\r\n\r\n',
			];
			assertHashNormalines('abs', values);
		});

		it('should return identical hash for similar padded multiline string', () => {
			var values = [
				'\n a\n b \n c\n',
				'\r a\r\n b \n c\r\n',
				'\r\n a\r\n b \r\n c\r\n',
				'\r\n\r\n a\r\n\r\n\r\n b \r\n c\r\n\r\n\r\n',
			];
			assertHashNormalines('abs', values);
		});

		it('should not return identical hash for mixed abc string', () => {
			var values = [
				'abc',
				' abc ',
				'   abc  ',
				'\n abc \n',
				' abc \r\n'
			];
			assertHashNormalines('abs', values, false);
		});
	});
});
