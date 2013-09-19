///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/Set.ts" />

describe('xm.Set', () => {

	var list:xm.Set;

	it('is defined', () => {
		assert.ok(xm.Set);
	});
	it('is a constructor', () => {
		assert.ok(new (xm.Set)());
	});

	describe('default', () => {
		beforeEach(() => {
			list = new xm.Set();
		});
		afterEach(() => {
			list = null;
		});

		it('is instanced', () => {
			assert.ok(list);
		});
		it('starts empty', () => {
			assert.strictEqual(list.count(), 0);
		});
		it('returns false if not containing data', () => {
			assert.isFalse(list.has(null));
			assert.isFalse(list.has(''));
			assert.isFalse(list.has('xyz'));
		});
		it('adds data', () => {
			list.add(1);
			list.add(2);
			list.add(3);
			var values = list.values();
			assert.strictEqual(list.count(), 3, 'count');
			assert.sameMembers(values, [1, 2, 3], 'values');
		});
		it('adds same data only once', () => {
			list.add(1);
			list.add(1);
			list.add(1);
			list.add(2);
			list.add(3);
			var values = list.values();
			assert.strictEqual(list.count(), 3, 'count');
			assert.sameMembers(values, [1, 2, 3], 'values');
		});
		it('removes data', () => {
			list.add(1);
			list.add(2);
			list.add(3);
			list.remove(2);
			list.remove(3);
			var values = list.values();
			assert.strictEqual(list.count(), 1, 'count');
			assert.sameMembers(values, [1], 'values');
		});
		it('counts data', () => {
			list.add(1);
			list.add(2);
			list.add(3);
			assert.strictEqual(list.count(), 3, 'count');
			assert.strictEqual(list.count(), list.values().length, 'count vs values');
		});
		it('imports data', () => {
			list.import([1, 1, 1, 2, 3]);
			var values = list.values();
			assert.strictEqual(list.count(), 3, 'count');
			assert.sameMembers(values, [1, 2, 3], 'values');
		});
		it('adds data in constructor', () => {
			list = new xm.Set([1, 1, 1, 2, 3]);
			var values = list.values();
			assert.strictEqual(list.count(), 3, 'count');
			assert.sameMembers(values, [1, 2, 3], 'values');
		});
		it('clears data', () => {
			list.add(1);
			list.add(2);
			list.add(3);
			list.clear();
			var values = list.values();
			assert.strictEqual(list.count(), 0, 'count');
			assert.sameMembers(values, [], 'values');
		});
	});
});