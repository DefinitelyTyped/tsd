///<reference path="../_ref.ts" />
///<reference path="../xm/assertVar.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/hash.ts" />

module git {

	export class GithubAPICachedResult {

		private _key:string;
		private _label:any;
		private _data:any;
		private _lastSet:Date;

		constructor(label:String, key:string, data:any) {
			xm.assertVar('label', label, 'string');
			xm.assertVar('key', key, 'string');
			xm.assertVar('data', data, 'object');

			this._label = label;
			this._key = key;
			this.setData(data);
		}

		setData(data:any):void {
			xm.assertVar('data', data, 'object');
			this._data = data;
			this._lastSet = new Date();
		}

		toJSON():any {
			return {
				key: this.key,
				hash: this.getHash(),
				data: this.data,
				label: this.label,
				lastSet: this.lastSet.getTime()
			};
		}

		//TODO test this against toJSON()
		//TODO why not JSON Schema?
		static fromJSON(json:any):GithubAPICachedResult {
			xm.assertVar('label', json.label, 'string');
			xm.assertVar('key', json.key, 'string');
			xm.assertVar('data', json.data, 'object');
			xm.assertVar('lastSet', json.lastSet, 'number');

			var call = new git.GithubAPICachedResult(json.label, json.key, json.data);
			call._lastSet = new Date(json.lastSet);
			return call;
		}

		static getHash(key:string):string {
			return xm.sha1(key);
		}

		getHash():string {
			return GithubAPICachedResult.getHash(this._key);
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