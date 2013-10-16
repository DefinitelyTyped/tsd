///<reference path="../../_ref.d.ts" />
///<reference path="../assertVar.ts" />
///<reference path="../Logger.ts" />
///<reference path="hash.ts" />
///<reference path="../typeOf.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {
	'use strict';

	/*
	 CachedJSONValue: single cached result object holds data and meta-data
	 */
	//TODO add more hardening / verification
	export class CachedJSONValue {

		key:string = null;
		label:any = null;
		value:any = null;
		changed:Date = null;
		options:any = null;

		constructor(label:String, key:string, options?:any) {
			xm.assertVar(label, 'string', 'label');
			xm.assertVar(key, 'string', 'key');
			this.label = label;
			this.key = key;
			this.options = options || null;
			xm.ObjectUtil.lockProps(this, ['label', 'key', 'options']);
			Object.defineProperty(this, 'value', {enumerable: false});
		}

		setValue(value:any, changed?:Date):void {
			if (this.value) {
				throw new Error('already have a value');
			}
			if (!xm.isJSONValue(value)) {
				throw new Error('cannot store non-JSON values: ' + xm.typeOf(value));
			}
			xm.assertVar(changed, Date, 'changed', true);

			this.value = value;
			this.changed = changed || new Date();
			Object.freeze(this.changed);
			xm.ObjectUtil.lockProps(this, ['value', 'changed']);
		}

		toJSON():any {
			//TODO flatten content to string?

			var hash = this.getKeyHash();
			var checksum = xm.sha1(hash + xm.jsonToIdentHash(this.value));

			return {
				key: this.key,
				hash: hash,
				checksum: checksum,
				value: this.value,
				label: this.label,
				changed: this.changed.toISOString()
			};
		}

		//TODO unit-test this against toJSON()

		//TODO maybe JSON Schema? overkill?
		static fromJSON(json:any):xm.CachedJSONValue {
			xm.assertVar(json.label, 'string', 'label');
			xm.assertVar(json.key, 'string', 'key');
			xm.assertVar(json.hash, 'sha1', 'hash');
			xm.assertVar(json.checksum, 'sha1', 'checksum');
			xm.assertVar(json.changed, 'string', 'changed');

			var changedDateNum = Date.parse(json.changed);
			if (isNaN(changedDateNum)) {
				throw new Error('bad date: changed: ' + json.date);
			}

			var call = new xm.CachedJSONValue(json.label, json.key, json.options);
			call.setValue(json.value, new Date(changedDateNum));

			var checksum = xm.sha1(call.getKeyHash() + xm.jsonToIdentHash(call.value));
			if (checksum !== json.checksum) {
				throw new Error('json checksum mismatch');
			}
			return call;
		}

		static getHash(key:string):string {
			return xm.sha1(key);
		}

		getKeyHash():string {
			return xm.sha1(this.key);
		}
	}
}
