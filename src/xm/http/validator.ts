/// <reference path="../_ref.d.ts" />

import assert = require('../assert');
import assertVar = require('../assertVar');
import typeOf = require('../typeOf');
import jsonSchema = require('../json/jsonSchema');
import CacheObject = require('./CacheObject');

export interface IObjectValidator {
	assert(object: CacheObject):void
}

export class SimpleValidator implements IObjectValidator {
	assert(object: CacheObject): void {
		assert(typeOf.isValid(object.body), 'body valid');
	}

	static main = new SimpleValidator();
}

export class CacheValidator implements IObjectValidator {

	constructor(public schema) {
	}

	assert(object: CacheObject): void {
		jsonSchema.assert(object.info, this.schema);
	}
}

export class CacheAgeValidator implements IObjectValidator {
	maxAgeMili: number = 0;

	constructor(public schema, maxAgeMili?: number) {
		this.maxAgeMili = maxAgeMili;
	}

	assert(object: CacheObject): void {
		jsonSchema.assert(object.info, this.schema);

		var date = new Date(object.info.cacheUpdated);
		if (typeOf.isNumber(this.maxAgeMili)) {
			var compare = new Date();
			assert(date.getTime() < compare.getTime() + this.maxAgeMili, 'checksum {a} vs {e}', date.toISOString(), compare.toISOString());
		}
	}
}

export class ChecksumValidator implements IObjectValidator {
	assert(object: CacheObject): void {
		assertVar(object.body, Buffer, 'body');
		assertVar(object.bodyChecksum, 'sha1', 'bodyChecksum');
		assertVar(object.info.contentChecksum, 'sha1', 'contentChecksum');
		assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
	}
}
