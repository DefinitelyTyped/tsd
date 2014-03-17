/// <reference path="../_ref.d.ts" />

import fs = require('graceful-fs');
import path = require('path');
import Promise = require('bluebird');
import tv4 = require('tv4');

import typeOf = require('../typeOf');
import assert = require('../assert');
import log = require('../log');

var reporter = require('tv4-reporter');
/*
 IContentKoder: transcode NodeBuffers (mostly all about JSONKoder)
 */
// TODO simplified this (not both ways)
// TODO scheduled for reimplementation using streams (with next-gen HTTP cache)
export interface IContentKoder<T> {
	decode(content: NodeBuffer):Promise<T>;
	encode(value: T):Promise<NodeBuffer>;
}

export class StringKoder {

	constructor(public encoding = 'utf8') {

	}

	decode(content: NodeBuffer): Promise<string> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(content)) {
				throw new Error('undefined content');
			}
			return content.toString(this.encoding);
		});
	}

	encode(value: string): Promise<NodeBuffer> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(value)) {
				throw new Error('undefined content');
			}
			return new Buffer(value, this.encoding);
		});
	}

	static utf8 = new StringKoder('utf8');
}

// this looks weird...
export class ByteKoder {

	decode(content: NodeBuffer): Promise<NodeBuffer> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(content)) {
				throw new Error('undefined content');
			}
			return content;
		});
	}

	encode(value: NodeBuffer): Promise<NodeBuffer> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(value)) {
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
export class JSONKoder<T> {
	schema: any;

	constructor(schema?: Object) {
		this.schema = schema;
	}

	decode(content: NodeBuffer): Promise<T> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(content)) {
				throw new Error('undefined content');
			}
			return JSON.parse(content.toString('utf8'));
		}).then((value: T) => {
			this.assert(value);
			return value;
		});
	}

	assert(value: T): void {
		assert(typeOf.isJSONValue(value), 'is not a JSON value {a}', value);
		if (this.schema) {
			// validate schema
			var res: TV4SingleResult = tv4.validateResult(value, this.schema);
			if (!res.valid || res.missing.length > 0) {
				var report = reporter.getReporter(log.out.getWrite(), log.out.getStyle());
				var test = report.createTest(this.schema, value, null, res, true);
				if (res.missing.length > 0) {
					report.reportMissing(test, '   ');
					throw new Error('missing schemas');
				}
				else {
					report.reportError(test, res.error, '   ', '   ');
					throw res.error;
				}
			}
		}
	}

	encode(value: T): Promise<NodeBuffer> {
		return Promise.attempt(() => {
			if (!typeOf.isValid(value)) {
				throw new Error('undefined content');
			}
			this.assert(value);
			return new Buffer(JSON.stringify(value, null, 2), 'utf8');
		});
	}

	static main = new JSONKoder<any>();
}
