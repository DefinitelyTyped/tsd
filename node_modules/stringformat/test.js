var assert = require('assert'),
	$ = require('./index')

module.exports = {
	'test .format() is undefined': function() {
		assert.ok(typeof String.prototype.format === 'undefined')
	},
	'test installs .format()': function() {
		$.extendString()
		assert.ok(typeof String.prototype.format === 'function')
	},
	'test installs as .zzzformat()': function() {
		$.extendString('zzzformat')
		assert.ok(typeof String.prototype.zzzformat === 'function')
		delete String.prototype.zzzformat
	},
	'test standalone': function() {
		assert.equal($("Test [{0}]", 42.5), "Test [42.5]")
	},
	'test as method': function() {
		assert.equal("Test [{0}]".format(42.5), "Test [42.5]")
	},
	'test integer modifier': function() {
		assert.equal($("Test [{0:i}]", 42.5), "Test [43]")
	},
	'test padding': function() {
		assert.equal($("Test [{0:8}]", 42.5), "Test [    42.5]")
	},
	'test with a function': function() {
		assert.equal($("Test [{0}]", function() { return "xxx" }), "Test [xxx]")
	},
	'test with a function and vars': function() {
		var x = 0
		assert.equal($("Test [{0}] [{0}] [{0}]", function() { return ++x }), "Test [1] [2] [3]")
	},
	'test JSON modifier': function() {
		assert.equal($("Test [{0:j}]", {foo:1, bar:2}), 'Test [{"foo":1,"bar":2}]')
	},
	'test with an object and named properties': function() {
		assert.equal($("Test [{foo:4}]", {foo:1}), 'Test [   1]')
		assert.equal($("Test [{foo.bar:4}]", {foo:{bar:1}}), 'Test [   1]')
		var Foo = function() {this.foo = 1}
		assert.equal($("Test [{foo:4}]", new Foo), 'Test [   1]')
		Foo.prototype.bar = function() { return this.foo + 1 }
		assert.equal($("Test [{bar:4}]", new Foo), 'Test [   2]')
	},
	'test with multiple objects and named properties': function() {
		assert.equal($("Test [{0|foo.bar:4}] [{1|foo.bar:4}]", {foo:{bar:4}}, {foo:{bar:8}}), 'Test [   4] [   8]')
	},
	'test with negative padding': function() {
		assert.equal($("Test [{0:-4}]", 12), 'Test [12  ]')
	},
	'test with padding width too small': function() {
		assert.equal($("Test [{0:1}]", 9999), 'Test [9999]')
	},
	'test fancy test': function() {
		assert.equal(
			$("The string {0:j} is {length}-character long", "Hello, World!"),
			'The string "Hello, World!" is 13-character long'
		)
	},
	'test with NaN': function() {
		var x
		assert.equal($("{0:8i}", x), "     NaN")
		assert.equal($("{0:8i}", "xxx"), "     NaN")
		assert.equal($("{0:8i}"), "     NaN")
		assert.equal($("{foo.bar.baz:i}"), "NaN")
	},
	'test with undefined properties (and no i modifier)': function() {
		assert.equal($("{foo.bar.baz}", {foo:{bar:{}}}), "{foo.bar.baz}")
		assert.equal($("{foo.bar.baz}"), "{foo.bar.baz}")
	}
	,
	'test with escaped replacements': function() {
		assert.equal($("{{0}} is [{0}]", 1), "{0} is [1]")
	},
	'test with multiple functions in property chain': function() {
		assert.equal(
			$("{foo.bar.baz.boom}", {
				foo: function() {
					return {
						bar: function() {
							return {
								baz: function() {
									return {
										boom: function() {
											return 1
										}
									}
								}
							}
						}
					}
				}
			}),
			"1"
		)
	},
	'test with multiple functions in property chain (2)': function() {
		assert.equal(
			$("{foo.bar.baz}", {
				foo: function() {
					return {
						bar: {
							value: 1,
							baz: function() {
								return this.value
							}
						}
					}
				}
			}),
			"1"
		)
	}
}
