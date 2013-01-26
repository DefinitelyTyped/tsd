# StringFormat
[![Build Status](https://secure.travis-ci.org/jcayzac/stringformat.js.png?branch=master)](http://travis-ci.org/jcayzac/stringformat.js)

## Description
This module provides a simple function that can be used to format strings,
using replacements such as {0}, {foo}, etc.

## Features
* Node/browser compatible.
    * In the browser, it gets installed as `window.stringformat` (call `window.stringformat.extendString()` to install the `String.format()` method).
* Order-independent replacements, so that format strings can be localized.
    * Example: `Hello {firstname} {lastname}` in English, `こんにちは、{lastname}{firstname}さん` in Japanese.
* Can pass one or several objects, and use property names instead of numbers.
* Support modifiers to output values as integers or JSON.
* Opt-in `String.prototype` extension (using `extendString()`)

## Install

```
npm install stringformat
```

## API
### stringformat(*format string*, *parameters*...)
Returns a new string formatted according to *format string*.

#### Example usage:
```js
var stringformat = require('stringformat')
console.log(stringformat("Hello, {0}!", "World"))
```

…would output `Hello, World!` to the console.

### stringformat.extendString([*methodName*])
Installs the module as `String.prototype.methodName`.
If omitted, *methodName* defaults to **format**.

#### Example usage:
```js
var stringformat = require('stringformat')

stringformat.extendString('coolFormat')
console.log("Hello, {0}!".coolFormat("World"))
```

…would output `Hello, World!` to the console.

## Format strings syntax
All the examples shown below assume `stringformat.extendString()` has been called.

### Basic replacements
The most simple replacements look like `{0}`, `{1}` and so on.
The number is the index of the parameter.

```js
"Hello, {1}! I feel {0} today!".format("great", "World")
'Hello, World! I feel great today!'
```

You can also use functions:

```js
"Hello, {1}! I feel {0} today!".format("great", function() { return "World" })
'Hello, World! I feel great today!'
```

```js
var x = 0
"{0} {0} {0}…".format(function() { return ++x })
'1 2 3…'
```

If a replacement cannot be resolved, the method does nothing:

```js
"Hello, {1}! I feel {0} today!".format("great")
'Hello, {1}! I feel great today!'
```

### Padding
If you want to pad the result, for instance to print a list of values, you can do it like this:

```js
"User name: [{0:20}]".format("Bob Harris")
'User name: [          Bob Harris]'
```

…this gives you a replaced content that is at least 20 characters wide. Positive integers mean the value will get right-aligned. To align it to the left, use a negative value:

```js
"User name: [{0:-20}]".format("Bob Harris")
'User name: [Bob Harris          ]'
```

### The JSON modifier
If you want to output a JSON version of the value, you can use it with the **j** modifier.
Compare the output above with the one below:

```js
"User name: {0:j}".format("Bob Harris")
'User name: "Bob Harris"'
```

Of course you can use objects slightly more complex than a string:

```js
"User name: {0:j}".format({foo:{bar:1}})
'User name: {"foo":{"bar":1}}'
```

…or even a function:

```js
"User name: {0:j}".format(function() { return {foo:{bar:1}} })
'User name: {"foo":{"bar":1}}'
```

### The integer modifier
If you want to output integer values only, use the **i** modifier.
Floating values will get rounded, and values that are not numbers will output `NaN`.

```js
"value = {0:i}".format(12.5)
'value = 13'
```

```js
"[value:{0:4i}]".format(12.5)
'[value:  13]'
```

```js
"[value:{0:4i}]".format("foo")
'[value: NaN]'
```

```js
"[value:{0:4i}]".format()
'[value: NaN]'
```

```js
"[value:{0:4i}]".format(function() { var undef; return undef })
'[value: NaN]'
```

As an exception to the rule mentioned above,

> If a replacement cannot be resolved, the method does nothing

…if the integer modifier is specified, unresolved replacements will result in a `NaN`
being outputted.

### Named properties
You can also use names instead of indexes.

```js
"[{foo:-4i}]".format({foo:1})
'[1   ]'
```

```js
"[{foo.bar:-4i}]".format({foo:{bar:1}})
'[1   ]'
```

```js
"The string {0:j} is {length}-character long".format("Hello, World!")
'The string "Hello, World!" is 13-character long'
```

```js
var Foo = function() {
	this.foo = 1
}
"[{foo:-4i}]".format(new Foo)
'[1   ]'
```

```js
var Foo = function() {
	this.foo = 1
}
Foo.prototype.bar = function() { return this.foo + 1 }
"[{bar:-4i}]".format(new Foo)
'[2   ]'
```

If you specify a property as `foo.bar.baz` and `baz` is a function,
`this` will be equal to `foo.bar` when it gets called.
And if either `foo` or `bar` were functions, too, they will be evaluated in turn!

```js
"[{foo.bar.baz:4i}]".format({
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
})
'[   1]'
```

### Accessing properties from multiple objects
Each replacement can be prefixed with an object index followed by a pipe symbol.

```js
"[{0|foo.bar:4}] [{1|foo.bar:4}]".format({foo:{bar:4}}, {foo:{bar:8}})
'[   4] [   8]'
```

### Escaping
Replacement specifiers can be escaped by doubling the opening and closing braces:

```js
"{{0}} is [{0}]".format(1)
'{0} is [1]'
```

## Running the tests
Clone this repository somewhere, then do:

```sh
$ npm install
$ npm test
```

## License
(The MIT License)

Copyright (c) 2012 Julien Cayzac <julien.cayzac@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
