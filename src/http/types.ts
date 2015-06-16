/// <reference path="../_ref.d.ts" />

import Joi = require('joi');

export interface Manage {
	lastSweep: Date;
}

export var manageSchema = Joi.object({
	lastSweep: Joi.date().required()
}).description('manageSchema');

export interface Info {
	url: string;
	key: string;
	contentType: string;
	httpETag: string;
	httpModified: Date;
	cacheCreated: Date;
	cacheUpdated: Date;
	contentChecksum: string;
}

// "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$"

export var infoSchema = Joi.object({
	url: Joi.string().required(),
	key: Joi.string().required(),
	contentType: Joi.string().required(),
	httpETag: Joi.string().required(),
	httpModified: Joi.date().required(),
	cacheCreated: Joi.date().required(),
	cacheUpdated: Joi.date().required(),
	contentChecksum: Joi.string().required()
}).description('infoSchema');

export var sha1Schema = Joi.string().length(40).regex(/^[0-9a-f]{40}$/).description('sha1');

export var objectSchema = Joi.object({
	info: infoSchema.required(),
	request: Joi.object().required(),
	response: Joi.object().optional(),
	body: Joi.binary(),
	storeDir: Joi.string().required(),
	bodyFile: Joi.string().required(),
	infoFile: Joi.string().required(),
	bodyChecksum: sha1Schema.required()
}).description('objectSchema');
