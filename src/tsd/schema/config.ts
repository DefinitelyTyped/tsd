/// <reference path="../_ref.d.ts" />

'use strict';

import Joi = require('joi');
import Const = require('../context/Const');

var schema = Joi.object({
	version: Joi
		.string().regex(/^v\d+$/)
		.default(Const.configVersion)
		.required()
		.description('config-format version'),
	path: Joi
		.string().regex(/^[\w\.-]+(?:\/[\w\.-]+)*$/)
		.default(Const.typingsDir)
		.required()
		.description('path to definition directory'),
	repo: Joi
		.string().regex(/^[\w\.-]+\/[\w\.-]+$/)
		.default(Const.definitelyRepo)
		.required()
		.description('github repository "owner/name"'),
	ref: Joi
		.string().regex(/^[\w\.-]+(?:\/[\w\.-]+)*$/)
		.default(Const.mainBranch)
		.required()
		.description('git ref (branch/commit'),
	cache: Joi
		.string()
		.optional()
		.description('path to (shared) tsd-cache'),
	bundle: Joi
		.string().regex(/\w+\.ts$/)
		.default(Const.typingsDir + '/' + Const.bundleFile)
		.optional()
		.description('path to <reference /> bundle'),
	stats: Joi
		.boolean()
		.default(Const.statsDefault)
		.optional()
		.description('toggle stats tracking'),
	installed: Joi
		.object()
		.pattern(/^([a-z](?:[\._-]?[a-z0-9]+)*)(\/[a-z](?:[\._-]?[a-z0-9]+)*)+\.d\.ts$/, Joi.object({
			commit: Joi.string()
				.required()
				.regex(/^[0-9a-f]{6,40}$/)
				.description('git commit sha1 hash')
		}))
		.unknown(false)
		.optional()
		.description('installed definitions')
}).options({
	convert: false,
	allowUnknown: true
}).description('TSD config & data file');

export = schema;
