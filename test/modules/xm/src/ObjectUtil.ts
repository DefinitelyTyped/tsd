///<reference path="../../../_ref.ts" />
///<reference path="../../../../src/xm/DateUtil.ts" />

class ObjectUtilTestClass {
	private _propA:string = 'a';
	private _propB:string = 'b';
	propC:string = 'c';
	propD:string = 'd';
}

describe('xm.ObjectUtil', () => {
	it('hidePrefixed() should return formatted string', () => {
		var keys;
		var inst = new ObjectUtilTestClass();

		keys = Object.keys(inst);
		assert.sameMembers(keys, ['_propA', '_propB', 'propC', 'propD'], 'before hide');

		xm.ObjectUtil.hidePrefixed(inst);

		keys = Object.keys(inst);
		assert.sameMembers(keys, ['propC', 'propD'], 'after hide');
	});
});