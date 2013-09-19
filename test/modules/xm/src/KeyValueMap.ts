///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/KeyValueMap.ts" />

describe('xm.KeyValueMap', () => {

	var map:xm.KeyValueMap;

	it('is defined', () => {
		assert.ok(xm.KeyValueMap);
	});
	it('is a constructor', () => {
		assert.ok(new (xm.KeyValueMap)());
	});

	describe('default', () => {

		//TODO rewrite tests so no state has to be kept between cases

		before(() => {
			map = new xm.KeyValueMap();
		});
		after(() => {
			map = null;
		});

		it('is instanced', () => {
			assert.ok(map);
		});
		it('returns undefined for unset data', () => {
			assert.notOk(map.get(null));
			assert.notOk(map.get(''));
			assert.notOk(map.get('xyz'));
		});
		it('returns alt value for unset data', () => {
			assert.strictEqual(map.get('xyz', 'abc'), 'abc');
			assert.strictEqual(map.get('xyz', 123), 123);
			assert.strictEqual(map.get('xyz', false), false);
			assert.strictEqual(map.get('xyz', true), true);
		});

		describe('with data', () => {
			it('stores by name', () => {
				map.set('aa', 'valueA');
				map.set('bb__bb', 100);
				map.set('cc', [1,2,3]);
				assert.strictEqual(map.get('aa'), 'valueA');
				assert.strictEqual(map.get('bb__bb'), 100);
				assert.deepEqual(map.get('cc'), [1,2,3]);
			});
			it('lists correct keys', () => {
				assert.deepEqual(map.keys(), ['aa', 'bb__bb', 'cc']);
			});
			it('lists correct values', () => {
				assert.deepEqual(map.values(), [<any>'valueA', 100, [1,2,3]]);
			});
			it('lists correct filtered values', () => {
				assert.deepEqual(map.values(['bb__bb', 'cc']), [<any>100, [1,2,3]]);
			});
			it('overrides data by name', () => {
				map.set('aa', 200);
				assert.strictEqual(map.get('aa'), 200);
				map.set('aa', 'valueA');
				assert.strictEqual(map.get('aa'), 'valueA');
			});
			it('removes data by name', () => {
				map.remove('bb__bb');
				map.remove('cc');
				assert.notOk(map.get('bb__bb'));
				assert.strictEqual(map.get('bb__bb', 123), 123);
				assert.deepEqual(map.keys(), ['aa']);
			});

			it('has updated keys after remove', () => {
				assert.include(map.keys(), 'aa');
				assert.notInclude(map.keys(), 'bb__bb');
			});
			it('returns alt value for removed data', () => {
				assert.strictEqual(map.get('bb__bb', 6), 6);
			});
			it('clears filtered', () => {
				map.set('aa', 'valueA');
				map.set('bb__bb', 100);
				map.set('cc', [1,2,3]);
				assert.deepEqual(map.keys(), ['aa', 'bb__bb', 'cc']);
				map.clear(['bb__bb']);
				assert.deepEqual(map.keys(), ['aa', 'cc']);
			});
			it('clears all', () => {
				map.clear();
				assert.lengthOf(map.keys(), 0);
			});
		});

		describe('import/export', () => {

			var data;

			before(() => {
				data = {aa: 'valueAAA', 'bb__bb': 321, cc:[1,2,3]};
			});
			after(() => {
				data = null;
			});

			it('from object', () => {
				map = new xm.KeyValueMap();
				map.import(data);

				assert.deepEqual(map.keys(), ['aa', 'bb__bb', 'cc']);
				assert.strictEqual(map.get('aa'), 'valueAAA');
				assert.strictEqual(map.get('bb__bb'), 321);
				assert.deepEqual(map.get('cc'), [1,2,3]);
			});

			it('from object filtered', () => {
				map = new xm.KeyValueMap();
				map.import(data, ['aa', 'cc']);

				assert.deepEqual(map.keys(), ['aa', 'cc']);
				assert.strictEqual(map.get('aa'), 'valueAAA');
				assert.deepEqual(map.get('cc'), [1,2,3]);
			});
			it('to object', () => {
				map = new xm.KeyValueMap();
				map.import(data);

				var exp = map.export();
				assert.ok(exp);
				assert.deepEqual(Object.keys(exp), ['aa', 'bb__bb', 'cc']);
				assert.strictEqual(map.get('aa'), exp.aa);
				assert.strictEqual(map.get('bb__bb'), exp.bb__bb);
				assert.deepEqual(map.get('cc'), exp.cc);
			});
			it('to object filtered', () => {
				map = new xm.KeyValueMap();
				map.import(data);

				var exp = map.export(['aa', 'cc']);
				assert.ok(exp);
				assert.deepEqual(Object.keys(exp), ['aa', 'cc']);
				assert.strictEqual(map.get('aa'), exp.aa);
				assert.deepEqual(map.get('cc'), exp.cc);
			});
			it('ignore non-object object', () => {
				map = new xm.KeyValueMap();
				map.import(null);
				assert.lengthOf(map.keys(), 0);
			});
			it('constructor param', () => {
				map = new xm.KeyValueMap(data);

				assert.deepEqual(map.keys(), ['aa', 'bb__bb', 'cc']);

				assert.strictEqual(map.get('aa'), 'valueAAA');
				assert.strictEqual(map.get('bb__bb'), 321);
				assert.deepEqual(map.get('cc'), [1,2,3]);
			});
		});
	});
});
