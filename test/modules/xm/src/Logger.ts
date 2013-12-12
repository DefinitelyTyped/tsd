/// <reference path="../../../globals.ts" />
/// <reference path="../../../../src/xm/StatCounter.ts" />
/// <reference path="../../../../src/xm/file.ts" />

describe('xm.Logger', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;
	var path = require('path');

	var miniwrite = <typeof MiniWrite> require('miniwrite');
	var ministyle = <typeof MiniStyle>  require('ministyle');

	var testPath = path.resolve('test', 'modules', 'xm');

	function assertLoggerShape(log:xm.Logger) {
		assert.isFunction(log, 'log');
		assert.isFunction(log.log, 'log.log');
		assert.isFunction(log.ok, 'log.ok');
		assert.isFunction(log.warn, 'log.warn');
		assert.isFunction(log.error, 'log.error');
		assert.isFunction(log.debug, 'log.debug');
		assert.isFunction(log.inspect, 'log.inspect');
		assert.isBoolean(log.enabled, 'log.enabled');
		assert.isTrue(log.enabled, 'log.enabled');
		assert.instanceOf(log.out, xm.StyledOut, 'log.out');
	}

	function assertLoggerBuffer(name:string, buffer:string) {
		var file = name + '.txt';
		xm.file.writeFileSync(path.resolve(testPath, 'tmp', 'logger', file), buffer);

		var expected = xm.file.readFileSync(path.resolve(testPath, 'fixtures', 'logger', file));
		assert.strictEqual(buffer, expected, name + ': stored results');
	}

	function writeStandard(log:xm.Logger) {
		log('aa');
		log.log('bb');
		log.ok('cc');
		log.warn('dd');
		log.error('ee');
		log.debug('ff');
		log.inspect({a: {b: 2}}, 0);
		log.inspect({a: {b: 2}}, 1);
		log.json({a: {b: 2}});
	}

	//more?
	it('global xm.log', () => {
		assertLoggerShape(xm.log);
	});

	it('instance', () => {
		var logger = xm.getLogger();
		assertLoggerShape(logger);
	});

	describe('getLogger', () => {

		it('disabled', () => {
			var log = xm.getLogger();
			var buffer = miniwrite.buffer();
			log.out = new xm.StyledOut(buffer, ministyle.dev());
			log.enabled = false;

			writeStandard(log);

			assertLoggerBuffer('disabled', buffer.concat('\n'));
		});

		it('basic', () => {
			var log = xm.getLogger();
			var buffer = miniwrite.buffer();
			log.out = new xm.StyledOut(buffer, ministyle.dev());

			writeStandard(log);

			assertLoggerBuffer('basic', buffer.concat('\n'));
		});

		it('label', () => {
			var log = xm.getLogger('x y z');
			var buffer = miniwrite.buffer();
			log.out = new xm.StyledOut(buffer, ministyle.dev());

			writeStandard(log);

			assertLoggerBuffer('label', buffer.concat('\n'));
		});

		it('multi', () => {
			var log = xm.getLogger();
			var buffer = miniwrite.buffer();
			log.out = new xm.StyledOut(buffer, ministyle.dev());

			log('aa', 1, 2);
			log.log('bb', 1, 2);
			log.ok('cc', 1, 2);
			log.warn('dd', 1, 2);
			log.error('ee', 1, 2);
			log.debug('ff', 1, 2);
			log.inspect({a: {b: 2}}, 0, 'foo');
			log.inspect({a: {b: 2}}, 1, 'foo');

			assertLoggerBuffer('multi', buffer.concat('\n'));
		});
	});
});
