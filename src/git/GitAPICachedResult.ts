///<reference path="../_ref.ts" />
///<reference path="../xm/callAsync.ts" />
///<reference path="../xm/KeyValueMap.ts" />
///<reference path="../xm/StatCounter.ts" />
///<reference path="../xm/io/hash.ts" />
///<reference path="../xm/io/Logger.ts" />
///<reference path="../xm/io/FileUtil.ts" />

module git {

	var async:Async = require('async');
	var _:UnderscoreStatic = require('underscore');
	var assert = require('assert');
	var mkdirp = require('mkdirp');
	var fs = require('fs');
	var path = require('path');

	export class GitAPICachedResult {

		private _key:string;
		private _label:any;
		private _data:any;
		private _lastSet:Date;

		constructor(label:String, key:string, data:any) {
			assert.ok(label, 'label');
			assert.ok(key, 'key');
			assert.ok(data, 'data');

			this._label = label;
			this._key = key;
			this.setData(data);
		}

		setData(data:any):void {
			this._data = data;
			this._lastSet = new Date();
		}

		toJSON():any {
			return {
				key: this.key,
				data: this.data,
				label: this.label,
				lastSet: this.lastSet.getTime()
			};
		}

		//TODO test this against toJSON()
		static fromJSON(json:any):GitAPICachedResult {
			assert.ok(json.label, 'json.label');
			assert.ok(json.key, 'json.key');
			assert.ok(json.data, 'json.data');
			assert.ok(json.lastSet, 'json.lastSet');
			var call = new GitAPICachedResult(json.label, json.key, json.data);
			call._lastSet = new Date(json.lastSet);
			return call;
		}

		static getHash(key:string):string {
			return xm.sha1(key);
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