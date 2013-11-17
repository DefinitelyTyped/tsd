///<reference path="../../tsdHelper.ts" />
///<reference path="../xm/unordered.ts" />

module helper {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	export function serialiseDef(def:tsd.Def, recursive:number = 0):any {
		xm.assertVar(def, tsd.Def, 'def');
		recursive -= 1;

		var json:any = {};
		json.path = def.path;
		json.project = def.project;
		json.name = def.name;
		json.semver = def.semver;
		if (recursive >= 0) {
			json.head = helper.serialiseDefVersion(def.head, recursive);
		}
		//version from the DefIndex commit +tree (may be not our edit)
		if (def.history && recursive >= 0) {
			json.history = [];
			def.history.forEach((file:tsd.DefVersion) => {
				json.history.push(helper.serialiseDefVersion(file, recursive));
			});
		}
		return json;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	export function assertDef(def:tsd.Def, values:any, message:string) {
		assert.ok(def, message + ': def');
		assert.ok(values, message + ': values');
		assert.instanceOf(def, tsd.Def, message + ': def');

		helper.propStrictEqual(def, values, 'path', message);
		helper.propStrictEqual(def, values, 'name', message);
		helper.propStrictEqual(def, values, 'project', message);

		if (values.semver) {
			helper.propStrictEqual(def, values, 'semver', message);
		}
		if (values.pathTerm) {
			helper.propStrictEqual(def, values, 'pathTerm', message);
		}
		if (values.head) {
			helper.assertDefVersion(def.head, values.head, message + '.head');
		}
		if (values.history) {
			//exactly this order
			for (var i = 0, ii = values.history.length; i < ii; i++) {
				helper.assertDefVersion(def.history[i], values.history[i], '#' + i);
			}
			helper.propStrictEqual(def.history, values.history, 'length', message);
		}
	}

	var assertDefArrayUnordered:AssertCB = helper.getAssertUnorderedLike((act:tsd.Def, exp:tsd.Def) => {
		return (act.path === exp.path);
	}, (act:tsd.Def, exp:tsd.Def, message?:string) => {
		assertDef(act, exp, message);
	}, 'Def');

	export function assertDefArray(defs:tsd.Def[], values:any[], message:string) {
		assertDefArrayUnordered(defs, values, message);
	}
}