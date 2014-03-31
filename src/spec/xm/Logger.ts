/// <reference path="../../_ref.d.ts" />

'use strict';

import path = require('path');
import chai = require('chai');
import assert = chai.assert;
import helper = require('../../test/helper');

import miniwrite = require('miniwrite');
import ministyle = require('ministyle');

import assertVar = require('../../xm/assertVar');
import fileIO = require('../../xm/file/fileIO');

import StyledOut = require('../../xm/lib/StyledOut');
import getLogger = require('../../xm/log/getLogger');
import Logger = require('../../xm/log/Logger');
import log = require('../../xm/log');

describe('Logger', () => {

	var testPath = path.resolve('test', 'spec', 'xm');

	function assertLoggerShape(log: Logger) {
		assert.isFunction(log, 'log');
		assert.isFunction(log.log, 'log.log');
		assert.isFunction(log.ok, 'log.ok');
		assert.isFunction(log.warn, 'log.warn');
		assert.isFunction(log.error, 'log.error');
		assert.isFunction(log.debug, 'log.debug');
		assert.isFunction(log.inspect, 'log.inspect');
		assert.isBoolean(log.enabled, 'log.enabled');
		assert.isTrue(log.enabled, 'log.enabled');
		assert.instanceOf(log.out, StyledOut, 'log.out');
	}

	function assertLoggerBuffer(name: string, buffer: string) {
		var file = name + '.txt';
		fileIO.writeFileSync(path.resolve(testPath, 'tmp', 'logger', file), buffer);

		var expected = fileIO.readFileSync(path.resolve(testPath, 'fixtures', 'logger', file));
		assert.strictEqual(buffer, expected, name + ': stored results');
	}

	function writeStandard(log: Logger) {
		log('aa');
		log.log('bb');
		log.ok('cc');
		log.warn('dd');
		log.error('ee');
		log.debug('ff');
		log.inspect({a: {b: 2}}, '', 0);
		log.inspect({a: {b: 2}}, '', 1);
		log.json({a: {b: 2}});
	}

	// more?
	it('global log', () => {
		assertLoggerShape(log);
	});

	it('instance', () => {
		var logger = getLogger();
		assertLoggerShape(logger);
	});

	describe('getLogger', () => {

		it('disabled', () => {
			var log = getLogger();
			var buffer = miniwrite.buffer();
			log.out = new StyledOut(buffer, ministyle.dev());
			log.enabled = false;

			writeStandard(log);

			assertLoggerBuffer('disabled', buffer.concat('\n'));
		});

		it('basic', () => {
			var log = getLogger();
			var buffer = miniwrite.buffer();
			log.out = new StyledOut(buffer, ministyle.dev());

			writeStandard(log);

			assertLoggerBuffer('basic', buffer.concat('\n'));
		});

		it('label', () => {
			var log = getLogger('x y z');
			var buffer = miniwrite.buffer();
			log.out = new StyledOut(buffer, ministyle.dev());

			writeStandard(log);

			assertLoggerBuffer('label', buffer.concat('\n'));
		});

		it('multi', () => {
			var log = getLogger();
			var buffer = miniwrite.buffer();
			log.out = new StyledOut(buffer, ministyle.dev());

			log('aa', 1, 2);
			log.log('bb', 1, 2);
			log.ok('cc', 1, 2);
			log.warn('dd', 1, 2);
			log.error('ee', 1, 2);
			log.debug('ff', 1, 2);
			log.inspect({a: {b: 2}}, 'foo', 0);
			log.inspect({a: {b: 2}}, 'foo', 1);

			assertLoggerBuffer('multi', buffer.concat('\n'));
		});
	});
});
