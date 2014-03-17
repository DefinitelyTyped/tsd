/// <reference path="../_ref.d.ts" />

import util = require('util');

import StyledOut = require('../lib/StyledOut');
import Logger = require('./Logger');
import LogLevel = require('./LogLevel');
import consoleOut = require('./consoleOut');

// TODO consider merging Logger for StyledOut
// TODO find pattern to use sub-loggers that auto-update when .out changes) (o.a EventLog need this)

function writeMulti(logger: Logger, args: any[]): void {
	var ret: string[] = [];
	for (var i = 0, ii = args.length; i < ii; i++) {
		var value: any = args[i];
		if (value && typeof value === 'object') {
			ret.push(util.inspect(value, <any>{showHidden: false, depth: 8}));
		}
		else {
			value = String(value);
			if (value.length === 0) {
				continue;
			}
			ret.push(value);
		}
	}
	if (ret.length > 0) {
		logger.out.line(ret.join('; '));
	}
}

// TODO should be createLogger as there is no storage
function getLogger(label?: string): Logger {

	label = arguments.length > 0 ? (String(label) + ' ') : '';

	var plain = function (...args: any[]) {
		if (logger.enabled) {
			writeMulti(logger, args);
		}
	};

	var doLog = function (logger: Logger, args: any[]) {
		if (args.length > 0) {
			writeMulti(logger, args);
		}
	};

	var logger: Logger = <Logger>(function (...args: any[]) {
		if (logger.enabled) {
			plain.apply(null, args);
		}
	});
	logger.out = consoleOut;
	logger.enabled = true;

	// alias
	logger.log = plain;

	logger.ok = function (...args: any[]) {
		if (logger.enabled) {
			logger.out.span('-> ').success(label + 'ok ');
			doLog(logger, args);
		}
	};
	logger.warn = function (...args: any[]) {
		if (logger.enabled) {
			logger.out.span('-> ').warning(label + 'warning ');
			doLog(logger, args);
		}
	};
	logger.error = function (...args: any[]) {
		if (logger.enabled) {
			logger.out.span('-> ').error(label + 'error ');
			doLog(logger, args);
		}
	};
	logger.debug = function (...args: any[]) {
		if (logger.enabled) {
			logger.out.span('-> ').accent(label + 'debug ');
			doLog(logger, args);
		}
	};
	logger.status = function (...args: any[]) {
		if (logger.enabled) {
			logger.out.accent('-> ').span(label + 'status ');
			doLog(logger, args);
		}
	};

	// meh..
	var map = Object.create(null);
	map[LogLevel.ok] = logger.ok;
	map['success'] = logger.ok;
	map[LogLevel.log] = logger.log;
	map[LogLevel.warn] = logger.warn;
	map['warning'] = logger.warn;
	map[LogLevel.error] = logger.error;
	map[LogLevel.debug] = logger.debug;
	map[LogLevel.status] = logger.status;

	logger.inspect = function (value: any, label?: string, depth: number = 3) {
		if (logger.enabled) {
			logger.out.span('-> ').cond(typeof label !== 'undefined' && label !== '', label + ' ').inspect(value, depth);
		}
	};
	logger.json = function (value: any, label?: string) {
		if (logger.enabled) {
			logger.out.span('-> ').cond(typeof label !== 'undefined' && label !== '', label + ' ').block(JSON.stringify(value, null, 3));
		}
	};

	logger.level = function (level: string, ...args: any[]) {
		if (level in map) {
			map[level].apply(null, args);
		}
		else {
			logger.warn.apply(null, args);
		}
	};

	return logger;
}

export = getLogger;
