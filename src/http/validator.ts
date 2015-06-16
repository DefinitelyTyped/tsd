/// <reference path="../_ref.d.ts" />

'use strict';

import Joi = require('joi');
import joiAssert = require('joi-assert');

import assert = require('../xm/assert');

import types = require('./types');
import CacheObject = require('./CacheObject');

export interface IObjectValidator {
	assert(object: CacheObject):void
}

export class CacheValidator implements IObjectValidator {

	assert(object: CacheObject): void {
		joiAssert(object.info, types.infoSchema);
	}
}

export class CacheAgeValidator implements IObjectValidator {
	maxAgeMili: number = 0;

	constructor(maxAgeMili?: number) {
		this.maxAgeMili = maxAgeMili;
	}

	assert(object: CacheObject): void {
		joiAssert(object.info, types.infoSchema);

		if (typeof this.maxAgeMili === 'number') {
			var date = new Date(object.info.cacheUpdated);
			var compare = new Date();
			assert(date.getTime() < compare.getTime() + this.maxAgeMili, 'date {a} vs {e}', date.toISOString(), compare.toISOString());
		}
	}
}

export class ChecksumValidator implements IObjectValidator {
	assert(object: CacheObject): void {
		joiAssert(object, types.objectSchema);
		assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
	}
}
