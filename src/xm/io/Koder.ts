///<reference path="../../_ref.d.ts" />
///<reference path="../ObjectUtil.ts" />
///<reference path="../promise.ts" />
///<reference path="../EventLog.ts" />
///<reference path="../hash.ts" />
///<reference path="../typeOf.ts" />
///<reference path="FileUtil.ts" />
///<reference path="../tv4Tool.ts" />
/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */
module xm {
	'use strict';

	var Q = require('q');
	var fs = require('fs');
	var path = require('path');
	var tv4:TV4 = require('tv4');

	//don't loose buried function (refactoring)
	xm.assertVar(xm.tv4.getReport, 'function', 'xm.tv4.getReport');

	export interface IContentKoder<T> {
		decode(content:NodeBuffer):Q.Promise<T>;
		encode(value:T):Q.Promise<NodeBuffer>;
	}

	export class StringKoder implements IContentKoder<string> {

		constructor(public encoding = 'utf8') {

		}

		decode(content:NodeBuffer):Q.Promise<string> {
			return Q().then(() => {
				if (!xm.isValid(content)) {
					throw new Error('undefined content');
				}
				return content.toString(this.encoding);
			});
		}

		encode(value:string):Q.Promise<NodeBuffer> {
			return Q().then(() => {
				if (!xm.isValid(value)) {
					throw new Error('undefined content');
				}
				return new Buffer(value, this.encoding);
			});
		}

		static utf8 = new StringKoder('utf8');
	}

	export class ByteKoder<NodeBuffer> implements IContentKoder<NodeBuffer> {

		decode(content:NodeBuffer):Q.Promise<NodeBuffer> {
			return Q().then(() => {
				if (!xm.isValid(content)) {
					throw new Error('undefined content');
				}
				return content;
			});
		}

		encode(value:NodeBuffer):Q.Promise<NodeBuffer> {
			return Q().then(() => {
				if (!xm.isValid(value)) {
					throw new Error('undefined content');
				}
				return value;
			});
		}

		static main = new ByteKoder();
	}

	/*
	 JSONKoder - json koder with json-schema (validate bot in AND output)
	 */
	export class JSONKoder<T> implements IContentKoder<T> {
		schema:any;

		constructor(schema?) {
			this.schema = schema;
		}

		decode(content:NodeBuffer):Q.Promise<T> {
			return Q().then(() => {
				if (!xm.isValid(content)) {
					throw new Error('undefined content');
				}
				return JSON.parse(content.toString('utf8'));
			}).then((value:T) => {
				this.assert(value);
				return value;
			});
		}

		assert(value:T):void {
			if (this.schema) {
				//validate schema
				var res:TV4SingleResult = tv4.validateResult(value, this.schema);
				if (!res.valid || res.missing.length > 0) {
					throw new Error(xm.tv4.getReport(value, this.schema, res).join('\n'));
				}
			}
		}

		encode(value:T):Q.Promise<NodeBuffer> {
			return Q().then(() => {
				if (!xm.isValid(value)) {
					throw new Error('undefined content');
				}
				this.assert(value);
				return new Buffer(JSON.stringify(value, null, 2), 'utf8');
			});
		}

		static main = new JSONKoder<any>();
	}
}
