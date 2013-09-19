///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/iterate.ts" />

describe('xm.iterate', () => {

	describe('eachElem()', () => {
		it('should iterate all elements', () => {
			var input = [2, 3, 4];
			var expected = [4, 9, 16];
			var actual = [];
			var i = 0;
			xm.eachElem(input, (elem:number, index:number, collection) => {
				actual.push(elem * elem);
				assert.strictEqual(index, i, 'index');
				assert.equal(input, collection, 'collection');
				i++;
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('eachProp()', () => {
		it('should iterate all properties', () => {
			var input = {a: 2, b: 3, c: 4};
			var expected = {a: 4, b: 9, c: 16};
			var actual = {};
			xm.eachProp(input, (elem:number, prop:string, collection) => {
				actual[prop] = elem * elem;
				assert.isString(prop, 'prop');
				assert.equal(input, collection, 'collection');
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('reduceArray()', () => {
		it('should iterate all elements', () => {
			var input = [2, 3, 4];
			var expected = [4, 9, 16];
			var i = 0;
			var actual = xm.reduceArray(input, [], (memo:number[], elem:number, index:number, collection) => {
				//copy for test
				memo = memo.slice(0);
				memo.push(elem * elem);
				assert.strictEqual(index, i, 'index');
				assert.equal(input, collection, 'collection');
				i++;
				return memo;
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('reduceObject()', () => {
		it('should iterate all properties', () => {
			var input = {a: 2, b: 3, c: 4};
			var expected = [4, 9, 16];
			var actual = xm.reduceHash(input, [], (memo:number[], elem:number, prop:string, collection) => {
				memo = memo.slice(0);
				memo.push(elem * elem);
				assert.isString(prop, 'prop');
				assert.equal(input, collection, 'collection');
				return memo;
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('mapArray()', () => {
		it('should iterate all elements', () => {
			var input = [2, 3, 4];
			var expected = [4, 9, 16];
			var i = 0;
			var actual = xm.mapArray(input, (elem:number, index:number, collection) => {
				assert.strictEqual(index, i, 'index');
				assert.equal(input, collection, 'collection');
				i++;
				return elem * elem;
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('mapHash()', () => {
		it('should iterate all properties', () => {
			var input = {a: 2, b: 3, c: 4};
			var expected = {a: 4, b: 9, c: 16};
			var actual = xm.mapHash(input, (elem:number, prop:string, collection) => {
				assert.isString(prop, 'prop');
				assert.equal(input, collection, 'collection');
				return elem * elem;
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('mapArray()', () => {
		it('should iterate all elements', () => {
			var input = [2, 3, 4, 5, 6, 7];
			var expected = [2, 4, 6];
			var i = 0;
			var actual = xm.filterArray(input, (elem:number, index:number, collection) => {
				assert.strictEqual(index, i, 'index');
				assert.equal(input, collection, 'collection');
				i++;
				return (elem % 2 === 0);
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});

	describe('mapHash()', () => {
		it('should iterate all properties', () => {
			var input = {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7};
			var expected = {a: 2, c: 4, e: 6};
			var actual = xm.filterHash(input, (elem:number, prop:string, collection) => {
				assert.isString(prop, 'prop');
				assert.equal(input, collection, 'collection');
				return (elem % 2 === 0);
			});
			assert.deepEqual(actual, expected, 'result');
		});
	});
});