/// <reference path="../../_ref.d.ts" />

'use strict';

import chai = require('chai');
var assert = chai.assert;
import helper = require('../../test/helper');

import hasher = require('../../xm/hash');
import encode = require('../../xm/encode');

describe('hash', () => {
	describe('sha1()', () => {
		it('should return correct hash', () => {
			var hash = hasher.sha1('foo bar');
			var expected = '3773dea65156909838fa6c22825cafe090ff8030';
			assert.strictEqual(hash, expected, 'preset');
			assert.strictEqual(hash, hasher.sha1('foo bar'), 'repeatable');
		});
	});
	describe('md5()', () => {
		it('should return correct hash', () => {
			var hash = hasher.md5('foo bar');
			var expected = '327b6f07435811239bc47e1544353273';
			assert.strictEqual(hash, expected, 'preset');
			assert.strictEqual(hash, hasher.md5('foo bar'), 'repeatable');
		});
	});
	describe('jsonToIdent()', () => {

		// TODO document intended differences (it a bit unclear now)

		var valueA = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};

		var valueHash = '5a896b7653c5d20c59762844c35fe55a193a8cca';

		var valueB = {c: [1, 2, 3], d: {b: 'bravo', a: 11, c: [11, 22, 33]}, a: 1, b: 'B'};

		var valueX1 = {a: 222, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};

		var valueX2 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'nope', c: [11, 22, 33]}};

		var valueX3 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo', c: [11, 22]}};

		var valueX4 = {a: 1, b: 'XX', c: [3, 2, 1], d: {a: 11, b: 'bravo', c: [11, 22, 33]}};

		var valueX5 = {a: 1, b: 'B', c: [1, 2, 3], d: {a: 11, b: 'bravo'}};

		it('should return correct hash for same object', () => {
			var ori = hasher.jsonToIdentHash(valueA);
			assert.isString(ori, 'ori');
			assert.strictEqual(ori, valueHash);
		});

		it('should return identical hash for same object', () => {
			var ori = hasher.jsonToIdentHash(valueA);
			var alt = hasher.jsonToIdentHash(valueA);
			assert.isString(ori, 'ori');
			assert.isString(alt, 'alt');
			assert.strictEqual(ori, alt);
		});

		it('should return identical hash for reordered data', () => {
			var ori = hasher.jsonToIdentHash(valueA);
			var alt = hasher.jsonToIdentHash(valueB);
			assert.strictEqual(ori, alt);
		});

		it('should return different hash for different data', () => {
			var ori = hasher.jsonToIdentHash(valueA);
			var alt;

			alt = hasher.jsonToIdentHash(valueX1);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX1');

			alt = hasher.jsonToIdentHash(valueX2);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX2');

			alt = hasher.jsonToIdentHash(valueX3);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX3');

			alt = hasher.jsonToIdentHash(valueX4);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX4');

			alt = hasher.jsonToIdentHash(valueX5);
			assert.notStrictEqual(ori, alt, 'valueA -> valueX5');
		});

		it('should throw on Function', () => {
			assert.throws(() => {
				hasher.jsonToIdentHash({a: 1, b: function (x) {
					return x * x;
				}});
			});
		});

		it('should throw on RegExp', () => {
			assert.throws(() => {
				hasher.jsonToIdentHash({a: 1, b: /^[0-9]+$/});
			});
		});

		it('should serialise Date, include millisecond level', () => {
			var valueA = new Date();
			var ori = hasher.jsonToIdentHash(valueA);
			var alt = hasher.jsonToIdentHash(new Date(valueA.getTime()));
			assert.strictEqual(ori, alt, 'identical values');
			alt = hasher.jsonToIdentHash(new Date(valueA.getTime() + 2));
			assert.notStrictEqual(ori, alt, 'milli second');
		});
	});

	describe('jsonToIdentHash()', () => {
		it('should return same hash for similar objects', () => {
			var valueA = {a: 1, b: 2, c: 3};
			var valueB = {b: 2, c: 3, a: 1};
			var hashA = hasher.jsonToIdentHash(valueA, 16);
			var hashB = hasher.jsonToIdentHash(valueB, 16);
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

		/* tslint:disable:max-line-length */

		function assertHashNormalines(label: string, values: string[], match: boolean = true) {
			var len = values.length;
			for (var i = 0; i < len; i++) {
				var valueA = values[i];
				var hashedA = hasher.hashNormalines(valueA);
				for (var j = (match ? i : i + 1); j < len; j++) {
					var valueB = values[j];
					var hashedB = hasher.hashNormalines(valueB);

					if (match) {
						assert.strictEqual(hashedA, hashedB, 'values: ' + label + ': (' + [i, j, len] + '): ' + encode.wrapIfComplex(valueA) + ' vs ' + encode.wrapIfComplex(valueB));
					}
					else {
						assert.notStrictEqual(hashedA, hashedB, 'values: ' + label + ': (' + [i, j, len] + '): ' + encode.wrapIfComplex(valueA) + ' vs ' + encode.wrapIfComplex(valueB));
					}
				}
			}
		}

		/* tslint:enable:max-line-length */

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
