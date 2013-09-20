///<reference path="../../_ref.ts" />
///<reference path="../assertVar.ts" />
///<reference path="Logger.ts" />
///<reference path="hash.ts" />
///<reference path="../typeOf.ts" />
///<reference path="../ObjectUtil.ts" />

module xm {

	/*
	 CachedJSONValue: single cached result object holds data and meta-data
	*/
	//TODO add more hardening / verification
	export class CachedJSONValue {

		private _key:string = null;
		private _label:any = null;
		private _data:any = null;
		private _lastSet:Date = null;

		constructor(label:String, key:string, data:any) {
			xm.assertVar('label', label, 'string');
			xm.assertVar('key', key, 'string');

			this._label = label;
			this._key = key;
			this.setData(data);

			xm.ObjectUtil.hidePrefixed(this);
		}

		setData(data:any):void {
			//TODO add data check?
			this._data = xm.isUndefined(data) ? null : data;
			this._lastSet = new Date();
		}

		toJSON():any {
			//TODO flatter content to string?
			return {
				key: this.key,
				hash: this.getHash(),
				data: this.data,
				label: this.label,
				lastSet: this.lastSet.getTime()
			};
		}
		//TODO unit-test this against toJSON()

		//TODO maybe JSON Schema? overkill?
		static fromJSON(json:any):xm.CachedJSONValue {
			xm.assertVar('label', json.label, 'string');
			xm.assertVar('key', json.key, 'string');

			//TODO verify data a bit better
			//xm.assertVar('data', json.data, 'object');

			xm.assertVar('lastSet', json.lastSet, 'number');

			var call = new xm.CachedJSONValue(json.label, json.key, json.data);
			call._lastSet = new Date(json.lastSet);
			return call;
		}

		static getHash(key:string):string {
			return xm.sha1(key);
		}

		getHash():string {
			return xm.CachedJSONValue.getHash(this._key);
		}

		get label():string {
			return this._label;
		}

		get key():string {
			return this._key;
		}

		get data():any {
			return this._data;
		}

		get lastSet():Date {
			return this._lastSet;
		}
	}
}