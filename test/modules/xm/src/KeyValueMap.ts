///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/KeyValueMap.ts" />

describe('xm.KeyValueMap', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;
	var map:xm.KeyValueMap<string>;

	it('is defined', () => {
		assert.ok(xm.KeyValueMap);
	});
	it('is a constructor', () => {
		assert.ok(new xm.KeyValueMap<string>());
	});

	describe('default', () => {

		beforeEach(() => {
			map = new xm.KeyValueMap<string>();
		});
		afterEach(() => {
			map = null;
		});

		it('is instanced', () => {
			assert.ok(map);
		});
		it('returns undefined for unset data', () => {
			assert.notOk(map.get('asdaa'));
			assert.notOk(map.get('xyz'));
		});
		it('throws on non=string data', () => {
			assert.throws(() => {
				assert.notOk(map.get(<any>123));
			}, /key must be a string$/);

			assert.throws(() => {
				assert.notOk(map.get(<string>{}));
			}, /key must be a string/);
		});
		it('returns alt value for unset data', () => {
			assert.strictEqual(new xm.KeyValueMap<string>().get('key', 'abc'), 'abc');
			assert.strictEqual(new xm.KeyValueMap<number>().get('key', 123), 123);
			assert.strictEqual(new xm.KeyValueMap<boolean>().get('key', false), false);
			assert.strictEqual(new xm.KeyValueMap<Date>().get('key', null), null);
		});

		describe('with data', () => {

			beforeEach(() => {
				map.set('aa', 'valueA');
				map.set('bb', 'valueB');
				map.set('cc', 'valueC');
			});

			it('stores by name', () => {
				assert.strictEqual(map.get('aa'), 'valueA');
				assert.strictEqual(map.get('bb'), 'valueB');
				assert.strictEqual(map.get('cc'), 'valueC');
			});
			it('lists correct keys', () => {
				assert.sameMembers(map.keys(), ['aa', 'bb', 'cc']);
			});
			it('lists correct values', () => {
				assert.sameMembers(map.values(), ['valueA', 'valueB', 'valueC']);
			});

			it('overrides data by name', () => {
				map.set('aa', '123');
				assert.strictEqual(map.get('aa'), '123');
				map.set('aa', 'valueA');
				assert.strictEqual(map.get('aa'), 'valueA');
			});
			it('removes data by name', () => {
				map.remove('bb');
				map.remove('cc');
				assert.notOk(map.get('bb'));
				assert.strictEqual(map.get('bb', '123'), '123');
				assert.sameMembers(map.keys(), ['aa']);
			});

			it('has updated keys after remove', () => {
				map.remove('bb');
				assert.include(map.keys(), 'aa');
				assert.notInclude(map.keys(), 'bb');
			});
			it('returns alt value for removed data', () => {
				map.remove('bb');
				assert.strictEqual(map.get('bb', '123'), '123');
			});
			it('clears all', () => {
				map.clear();
				assert.lengthOf(map.keys(), 0, 'keys');
			});
		});

		describe('import/export', () => {

			var data:any;

			beforeEach(() => {
				data = {
					'aa': 'valueA',
					'bb': 'valueB',
					'cc': 'valueC'
				};
			});
			afterEach(() => {
				data = null;
			});

			it('from object', () => {
				map = new xm.KeyValueMap<string>();
				map.import(data);

				assert.sameMembers(map.keys(), ['aa', 'bb', 'cc']);
				assert.strictEqual(map.get('aa'), 'valueA');
				assert.strictEqual(map.get('bb'), 'valueB');
				assert.strictEqual(map.get('cc'), 'valueC');
			});
			it('to object', () => {
				map = new xm.KeyValueMap();
				map.import(data);

				var exp = map.export();
				assert.ok(exp);
				assert.sameMembers(Object.keys(exp), ['aa', 'bb', 'cc']);

				assert.strictEqual(map.get('aa'), exp['aa']);
				assert.strictEqual(map.get('bb'), exp['bb']);
				assert.strictEqual(map.get('cc'), exp['cc']);
			});
			it('ignore non-object object', () => {
				map = new xm.KeyValueMap<string>();
				map.import(null);
				assert.lengthOf(map.keys(), 0, 'null import');

				map = new xm.KeyValueMap<string>();
				map.import(<any>[1,2,3]);
				assert.lengthOf(map.keys(), 0, 'array import');
			});
			it('constructor param', () => {
				map = new xm.KeyValueMap<string>(data);
				assert.sameMembers(map.keys(), ['aa', 'bb', 'cc']);

				assert.strictEqual(map.get('aa'), 'valueA');
				assert.strictEqual(map.get('bb'), 'valueB');
				assert.strictEqual(map.get('cc'), 'valueC');
			});
		});
	});
});
