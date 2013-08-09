///<reference path="../_ref.ts" />
///<reference path="../../src/xm/io/URLManager.ts" />

describe('xm.URLManager', function () {

	var urls:xm.URLManager;
	var expected;
	var actual;
	var base = 'https://example.com/{name}/{value}';

	it('should be defined', () => {
		assert.isFunction(xm.URLManager, 'constructor');
	});

	it('should be constructor', () => {
		urls = new xm.URLManager({name: 'foo'});
		assert.ok(urls, 'instance');
	});

	describe('setVar()', () => {
		it('should be defined', () => {
			assert.doesNotThrow(()=> {
				urls.setVar('sub', 'some');
			});
			assert.strictEqual(urls.getVar('sub'), 'some');
		});
	});

	describe('addTemplate()', () => {
		it('should add template', () => {
			assert.doesNotThrow(()=> {
				urls.addTemplate('main', 'https://example.com/{name}/{value}/{sub}');
			});
			assert.ok(urls.getTemplate('main'));
		});
	});

	describe('getTemplate()', () => {
		it('should be defined', () => {
			actual = urls.getTemplate('main');
			assert.isObject(actual);
			assert.isFunction(actual.expand);
		});
		it('should return template', () => {
			actual = urls.getTemplate('main');
			expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(actual.expand({name: 'foo', value: 'bar', sub: 'some'}), expected);
		});
	});

	describe('getURL()', () => {
		it('should return replaced url', () => {
			expected = 'https://example.com/foo/bar/some';
			assert.strictEqual(urls.getURL('main', {value: 'bar'}), expected);
		});
	});
});
