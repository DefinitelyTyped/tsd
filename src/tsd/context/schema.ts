/// <reference path="../_ref.d.ts" />

'use strict';

import path = require('path');
import Joi = require('joi');
import Const = require('./Const');

// TODO on-hold for https://github.com/spumko/joi/issues/261

var schema = Joi.object({
	version: Joi
		.string().regex(/^v[\\d]+$/)
		.default(Const.configVersion)
		.description('config-format version'),
	path: Joi
		.string()
		.default(Const.typingsDir)
		.description('path to definition directory'),
	repo: Joi
		.string().regex(/^[\w\.-]+\/[\w\.-]+$/)
		.default(Const.definitelyRepo)
		.description('github repository "owner/name"'),
	ref: Joi
		.string().regex(/^[\w\.-]+(?:\/[\w\.-]+)*$/)
		.default(Const.mainBranch)
		.description('git ref (branch/commit'),
	cache: Joi
		.string()
		.optional()
		.description('path to (shared) tsd-cache'),
	bundle: Joi
		.string().regex(/\w+\.ts$/)
		.default(Const.typingsDir + '/' + Const.bundleFile)
		.optional()
		.description('path to <reference /> bundle').optional(),
	stats: Joi
		.boolean()
		.default(Const.statsDefault)
		.optional()
		.description('enable stats tracking'),
	installed: Joi
		.object({

		})
		.options({
			allowUnknown: true
		})
		.optional()
		.description('installed definitions')
}).options({
	convert: false,
	allowUnknown: true
}).description('TSD config & data file');

export = schema;
