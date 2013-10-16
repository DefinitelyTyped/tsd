///<reference path="../../../globals.ts" />
///<reference path="../../../../src/xm/io/URLManager.ts" />

describe('xm.URLManager', () => {
	'use strict';

	var assert:Chai.Assert = require('chai').assert;

	var urls:xm.URLManager;
	var expected:string;
	var actual:xm.URLTemplate;

	it('should be defined', () => {
		assert.isFunction(xm.URLManager, 'constructor');
	});

	it('should be constructor', () => {
		urls = new xm.URLManager({name: 'foo'});
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
			actual = urls.getTemplate('main');
			assert.isObject(actual);

			assert.isFunction(actual.fillFromObject, 'fillFromObject');
			assert.isFunction(actual.fromUri, 'fromUri');
			assert.isFunction(actual.fill, 'fill');
		});
		it('should return template', () => {
			actual = urls.getTemplate('main');
			expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(actual.fillFromObject({name: 'foo', value: 'bar', sub: 'some'}), expected);
		});
	});

	describe('getURL()', () => {
		it('should return replaced url', () => {
			expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(urls.getURL('main', {value: 'bar'}), expected);
		});
	});
});
