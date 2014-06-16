/// <reference path="../../_ref.d.ts" />

'use strict';

import helper = require('../../test/helper');
import chai = require('chai');
var assert = chai.assert;

import URLManager = require('../../xm/lib/URLManager');

describe('URLManager', () => {

	var urls: URLManager;

	it('should be defined', () => {
		assert.isFunction(URLManager, 'constructor');
	});

	it('should be constructor', () => {
		urls = new URLManager({name: 'foo'});
		assert.isObject(urls, 'instance');
	});

	describe('setVar()', () => {
		it('should be defined', () => {
			urls.setVar('sub', 'some');
			assert.strictEqual(urls.getVar('sub'), 'some');
		});
	});

	describe('addTemplate()', () => {
		it('should add template', () => {
			urls.addTemplate('main', 'https://example.com/{name}/{value}/{sub}');
			assert.ok(urls.getTemplate('main'));
		});
	});

	describe('getTemplate()', () => {
		it('should be defined', () => {
			var actual = urls.getTemplate('main');
			assert.isObject(actual);

			assert.isFunction(actual.fillFromObject, 'fillFromObject');
			assert.isFunction(actual.fromUri, 'fromUri');
			assert.isFunction(actual.fill, 'fill');
		});
		it('should return template', () => {
			var actual = urls.getTemplate('main');
			var expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(actual.fillFromObject({name: 'foo', value: 'bar', sub: 'some'}), expected);
		});
	});

	describe('getURL()', () => {
		it('should return replaced url', () => {
			var expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(urls.getURL('main', {value: 'bar'}), expected);
		});
	});
});
