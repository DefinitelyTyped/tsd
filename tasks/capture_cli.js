var xm;
(function (xm) {
    'use strict';

    var natives = {
        '[object Arguments]': 'arguments',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object Function]': 'function',
        '[object Number]': 'number',
        '[object RegExp]': 'regexp',
        '[object String]': 'string'
    };

    function typeOf(obj) {
        var str = Object.prototype.toString.call(obj);
        if (natives[str]) {
            return natives[str];
        }
        if (obj === null) {
            return 'null';
        }
        if (obj === undefined) {
            return 'undefined';
        }
        if (obj === Object(obj)) {
            return 'object';
        }
        return typeof obj;
    }
    xm.typeOf = typeOf;

    var jsonTypes = [
        'array',
        'object',
        'boolean',
        'number',
        'string',
        'null'
    ];

    var primitiveTypes = [
        'boolean',
        'number',
        'string'
    ];

    var valueTypes = [
        'boolean',
        'number',
        'string',
        'null'
    ];

    var objectNameExp = /(^\[object )|(\]$)/gi;

    function toProtoString(obj) {
        return Object.prototype.toString.call(obj).replace(objectNameExp, '');
    }
    xm.toProtoString = toProtoString;

    var typeMap = {
        arguments: isArguments,
        array: isArray,
        date: isDate,
        function: isFunction,
        number: isNumber,
        regexp: isRegExp,
        string: isString,
        null: isNull,
        undefined: isUndefined,
        object: isObject,
        boolean: isBoolean,
        ok: isOk,
        valid: isValid,
        jsonValue: isJSONValue
    };

    function hasOwnProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    xm.hasOwnProp = hasOwnProp;

    function isType(obj, type) {
        if (hasOwnProp(typeMap, type)) {
            return typeMap[type].call(null, obj);
        }
        return false;
    }
    xm.isType = isType;

    function isArguments(obj) {
        return (typeOf(obj) === 'arguments');
    }
    xm.isArguments = isArguments;

    function isArray(obj) {
        return (typeOf(obj) === 'array');
    }
    xm.isArray = isArray;

    function isDate(obj) {
        return (typeOf(obj) === 'date');
    }
    xm.isDate = isDate;

    function isFunction(obj) {
        return (typeOf(obj) === 'function');
    }
    xm.isFunction = isFunction;

    function isNumber(obj) {
        return (typeOf(obj) === 'number');
    }
    xm.isNumber = isNumber;

    function isRegExp(obj) {
        return (typeOf(obj) === 'regexp');
    }
    xm.isRegExp = isRegExp;

    function isString(obj) {
        return (typeOf(obj) === 'string');
    }
    xm.isString = isString;

    function isNull(obj) {
        return (typeOf(obj) === 'null');
    }
    xm.isNull = isNull;

    function isUndefined(obj) {
        return (typeOf(obj) === 'undefined');
    }
    xm.isUndefined = isUndefined;

    function isObject(obj) {
        return (typeOf(obj) === 'object');
    }
    xm.isObject = isObject;

    function isBoolean(obj) {
        return (typeOf(obj) === 'boolean');
    }
    xm.isBoolean = isBoolean;

    function isArrayLike(obj) {
        return (typeOf(obj) === 'array' || typeOf(obj) === 'arguments');
    }
    xm.isArrayLike = isArrayLike;

    function isOk(obj) {
        return !!obj;
    }
    xm.isOk = isOk;

    function isValid(obj) {
        var type = typeOf(obj);
        return !(type === 'undefined' || type === 'null' || (type === 'number' && isNaN(obj)));
    }
    xm.isValid = isValid;

    function isJSONValue(obj) {
        return jsonTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isJSONValue = isJSONValue;

    function isPrimitive(obj) {
        return primitiveTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isPrimitive = isPrimitive;

    function isValueType(obj) {
        return valueTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isValueType = isValueType;

    function getTypeOfMap(add) {
        var name;
        var obj = {};
        for (name in typeMap) {
            if (hasOwnProp(typeMap, name)) {
                obj[name] = typeMap[name];
            }
        }
        if (add) {
            for (name in add) {
                if (hasOwnProp(add, name) && isFunction(add[name])) {
                    obj[name] = add[name];
                }
            }
        }
        return obj;
    }
    xm.getTypeOfMap = getTypeOfMap;

    function getTypeOfWrap(add) {
        var typeMap = getTypeOfMap(add);

        return function isTypeWrap(obj, type) {
            if (hasOwnProp(typeMap, type)) {
                return typeMap[type].call(null, obj);
            }
            return false;
        };
    }
    xm.getTypeOfWrap = getTypeOfWrap;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');
    var jsesc = require('jsesc');

    var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var stringQuote = '"';

    var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var intExp = /^\d+$/;

    var escapeRep = '\\$&';
    var escapeAdd = '\\$&$&';

    xm.singleQuoteExp = /([^'\\]*(?:\\.[^'\\]*)*)'/g;
    xm.doubleQuoteExp = /([^"\\]*(?:\\.[^"\\]*)*)"/g;

    function getReplacerFunc(matches, values) {
        return function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return values[i];
            }
            return match;
        };
    }
    xm.getReplacerFunc = getReplacerFunc;

    function getEscaper(vars) {
        var values = (xm.isString(vars.values) ? vars.values.split('') : vars.values);
        var matches = (xm.isString(vars.matches) ? vars.matches.split('') : vars.matches);
        var replacer = function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return '\\' + values[i];
            }
            return match;
        };

        var exp = new RegExp('[' + values.map(function (char) {
            return '\\' + char;
        }).join('') + ']', 'g');

        return function (input) {
            return input.replace(exp, replacer);
        };
    }
    xm.getEscaper = getEscaper;

    function getMultiReplacer(vars) {
        var values = vars.values;
        var matches = vars.matches;
        var replacer = function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return values[i];
            }
            return match;
        };

        var exp = new RegExp(vars.exps.map(function (char) {
            return '(?:' + char + ')';
        }).join('|'), 'g');

        return function (input) {
            return input.replace(exp, replacer);
        };
    }
    xm.getMultiReplacer = getMultiReplacer;

    xm.unprintCC = getEscaper({
        matches: '\b\f\n\r\t\v\0',
        values: 'bfnrtv0'
    });
    xm.unprintNL = getEscaper({
        matches: '\r\n',
        values: 'rn'
    });
    xm.unprintNotNL = getEscaper({
        matches: '\b\f\t\v\0',
        values: 'bftv0'
    });
    xm.unprintNLS = getMultiReplacer({
        exps: ['\\r\\n', '\\n', '\\r'],
        matches: ['\r\n', '\n', '\r'],
        values: ['\\r\\n\r\n', '\\n\n', '\\r\r']
    });

    function quoteSingle(input) {
        return input.replace(xm.singleQuoteExp, '$1\\\'');
    }
    xm.quoteSingle = quoteSingle;

    function quoteDouble(input) {
        return input.replace(xm.doubleQuoteExp, '$1\\"');
    }
    xm.quoteDouble = quoteDouble;

    function quoteSingleWrap(input) {
        return '\'' + input.replace(xm.singleQuoteExp, '$1\\\'') + '\'';
    }
    xm.quoteSingleWrap = quoteSingleWrap;

    function quoteDoubleWrap(input) {
        return '"' + input.replace(xm.doubleQuoteExp, '$1\\"') + '"';
    }
    xm.quoteDoubleWrap = quoteDoubleWrap;

    function escapeControl(input, reAddNewlines) {
        if (typeof reAddNewlines === "undefined") { reAddNewlines = false; }
        input = String(input);
        if (reAddNewlines) {
            return xm.unprintNLS(xm.unprintNotNL(input));
        }
        return xm.unprintCC(input);
    }
    xm.escapeControl = escapeControl;

    function wrapQuotes(input, double) {
        input = escapeControl(input);
        if (double) {
            return quoteDoubleWrap(input);
        }
        return quoteSingleWrap(input);
    }
    xm.wrapQuotes = wrapQuotes;

    function wrapIfComplex(input, double) {
        input = String(input);
        if (!identAnyExp.test(input)) {
            return wrapQuotes(xm.unprintCC(input), double);
        }
        return input;
    }
    xm.wrapIfComplex = wrapIfComplex;

    function trim(value, cutoff) {
        if (typeof cutoff === "undefined") { cutoff = 60; }
        if (cutoff && value.length > cutoff) {
            return value.substr(0, cutoff) + '...';
        }
        return value;
    }
    xm.trim = trim;

    function trimWrap(value, cutoff, double) {
        if (typeof cutoff === "undefined") { cutoff = 60; }
        value = String(value);
        if (cutoff && value.length > cutoff) {
            return xm.wrapQuotes(value.substr(0, cutoff), double) + '...';
        }
        return xm.wrapQuotes(value, double);
    }
    xm.trimWrap = trimWrap;

    var escapableExp = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
    var jsonNW = {
        json: true,
        wrap: false,
        quotes: 'double'
    };

    function escapeSimple(str) {
        escapableExp.lastIndex = 0;
        if (escapableExp.test(str)) {
            return str.replace(escapableExp, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }

                return jsesc(a, jsonNW);
            });
        }
        return str;
    }
    xm.escapeSimple = escapeSimple;
    function escapeHTML(html) {
        return String(html).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    xm.escapeHTML = escapeHTML;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function getFuncLabel(func) {
        var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(String(func));
        if (match && match.length >= 3) {
            return match[1] + '(' + match[2] + ')';
        }
        if (func.name) {
            return func.name;
        }
        return '<anonymous>';
    }
    xm.getFuncLabel = getFuncLabel;

    function toValueStrim(obj, depth, cutoff) {
        if (typeof depth === "undefined") { depth = 4; }
        if (typeof cutoff === "undefined") { cutoff = 80; }
        var type = xm.typeOf(obj);

        depth--;

        switch (type) {
            case 'boolean':
            case 'regexp':
                return obj.toString();
            case 'null':
            case 'undefined':
                return type;
            case 'number':
                return obj.toString(10);
            case 'string':
                return xm.trimWrap(obj, cutoff, true);
            case 'date':
                return obj.toISOString();
            case 'function':
                return xm.getFuncLabel(obj);
            case 'arguments':
            case 'array': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return '[' + xm.trim(obj.map(function (value) {
                    return xm.trim(value, depth);
                }).join(','), cutoff) + ']';
            }
            case 'object': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return xm.trim(String(obj) + ' {' + Object.keys(obj).sort().map(function (key) {
                    return xm.trim(key) + ':' + toValueStrim(obj[key], depth);
                }).join(','), cutoff) + '}';
            }
            default:
                throw (new Error('toValueStrim: cannot serialise type: ' + type));
        }
    }
    xm.toValueStrim = toValueStrim;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var AssertionError = require('assertion-error');

    function isSha(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{40}$/.test(value);
    }
    xm.isSha = isSha;

    function isShaShort(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{6,40}$/.test(value);
    }
    xm.isShaShort = isShaShort;

    function isMd5(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{32}$/.test(value);
    }
    xm.isMd5 = isMd5;

    var typeOfAssert = xm.getTypeOfMap({
        sha1: isSha,
        sha1Short: isShaShort,
        md5: isMd5
    });

    function assert(pass, message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        if (!!pass) {
            return;
        }
        if (xm.isString(message)) {
            message = message.replace(/\{([\w]+)\}/gi, function (match, id) {
                switch (id) {
                    case 'a':
                    case 'act':
                    case 'actual':
                        if (arguments.length > 2) {
                            return xm.toValueStrim(actual);
                        }
                        break;
                    case 'e':
                    case 'exp':
                    case 'expected':
                        if (arguments.length > 3) {
                            return xm.toValueStrim(expected);
                        }
                        break;
                    default:
                        return match;
                }
            });
        } else {
            message = '';
        }
        throw new AssertionError(message, { actual: actual, expected: expected, showDiff: showDiff }, ssf);
    }
    xm.assert = assert;

    function throwAssert(message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        xm.assert(false, message, actual, expected, showDiff, ssf);
    }
    xm.throwAssert = throwAssert;

    function assertVar(value, type, label, opt) {
        if (typeof opt === "undefined") { opt = false; }
        if (arguments.length < 3) {
            throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
        }
        var valueKind = xm.typeOf(value);
        var typeKind = xm.typeOf(type);

        if (!xm.isValid(value)) {
            if (!opt) {
                throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be defined as a ' + xm.toValueStrim(type) + ' but got ' + (valueKind === 'number' ? 'NaN' : valueKind));
            }
        } else if (typeKind === 'function') {
            if (!(value instanceof type)) {
                throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be instanceof ' + xm.getFuncLabel(type) + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
            }
        } else if (typeKind === 'string') {
            if (xm.hasOwnProp(typeOfAssert, type)) {
                var check = typeOfAssert[type];
                if (!check(value)) {
                    throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be a ' + xm.wrapQuotes(type, true) + ' but got a ' + xm.wrapQuotes(valueKind, true) + ': ' + xm.toValueStrim(value));
                }
            } else {
                throw new AssertionError('unknown type-assertion parameter ' + xm.wrapQuotes(type, true) + ' for ' + xm.toValueStrim(value));
            }
        } else {
            throw new AssertionError('bad type-assertion parameter ' + xm.toValueStrim(type) + ' for ' + xm.wrapQuotes(label, true));
        }
    }
    xm.assertVar = assertVar;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function deepFreezeRecursive(object, active) {
        var value, prop;
        active = (active || []);
        active.push(object);
        Object.freeze(object);
        for (prop in object) {
            if (object.hasOwnProperty(prop)) {
                value = object[prop];
                if (xm.isObject(value) || xm.isArray(value)) {
                    if (active.indexOf(object) < 0) {
                        deepFreezeRecursive(value, active);
                    }
                }
            }
        }
    }

    (function (object) {
        function hasOwnProp(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        object.hasOwnProp = hasOwnProp;

        function defineProp(object, property, settings) {
            Object.defineProperty(object, property, settings);
        }
        object.defineProp = defineProp;

        function defineProps(object, propertyNames, settings) {
            propertyNames.forEach(function (property) {
                xm.object.defineProp(object, property, settings);
            });
        }
        object.defineProps = defineProps;

        function hidePrefixed(object, ownOnly) {
            if (typeof ownOnly === "undefined") { ownOnly = true; }
            for (var property in object) {
                if (property.charAt(0) === '_' && (!ownOnly || xm.object.hasOwnProp(object, property))) {
                    xm.object.defineProp(object, property, { enumerable: false });
                }
            }
        }
        object.hidePrefixed = hidePrefixed;

        function hideProps(object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { enumerable: false });
            });
        }
        object.hideProps = hideProps;

        function lockProps(object, props, pub, pref) {
            if (typeof pub === "undefined") { pub = true; }
            if (typeof pref === "undefined") { pref = true; }
            props.forEach(function (property) {
                if (/^_/.test(property)) {
                    if (pref) {
                        Object.defineProperty(object, property, { writable: false });
                    }
                } else if (pub) {
                    Object.defineProperty(object, property, { writable: false });
                }
            });
        }
        object.lockProps = lockProps;

        function forceProps(object, props) {
            Object.keys(props).forEach(function (property) {
                Object.defineProperty(object, property, { value: props[property], writable: false });
            });
        }
        object.forceProps = forceProps;

        function freezeProps(object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
                Object.freeze(object[property]);
            });
        }
        object.freezeProps = freezeProps;

        function lockPrimitives(object) {
            Object.keys(object).forEach(function (property) {
                if (xm.isPrimitive(object[property])) {
                    Object.defineProperty(object, property, { writable: false });
                }
            });
        }
        object.lockPrimitives = lockPrimitives;

        function deepFreeze(object) {
            if (xm.isObject(object) || xm.isArray(object)) {
                deepFreezeRecursive(object, []);
            }
        }
        object.deepFreeze = deepFreeze;
    })(xm.object || (xm.object = {}));
    var object = xm.object;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');

    var miniwrite = require('miniwrite');
    var ministyle = require('ministyle');

    var StyledOut = (function () {
        function StyledOut(write, style) {
            this._tabSize = 3;
            this.nibs = {
                arrow: '-> ',
                double: '>> ',
                single: ' > ',
                bullet: ' - ',
                edge: ' | ',
                ruler: '---',
                shell: ' $ ',
                dash: '-- ',
                decl: ' : ',
                none: '   '
            };
            if (style) {
                ministyle.assertMiniStyle(style);
            }
            if (write) {
                miniwrite.assertMiniWrite(write);
            }
            this._style = (style || ministyle.ansi());
            this._line = miniwrite.chars((write || miniwrite.log()));
            xm.object.hidePrefixed(this);
        }
        StyledOut.prototype.write = function (str) {
            this._line.write(str);
            return this;
        };

        StyledOut.prototype.line = function (str) {
            if (arguments.length < 1 || typeof str === 'undefined') {
                this._line.writeln('');
            } else {
                this._line.writeln(this._style.plain(str));
            }
            return this;
        };

        StyledOut.prototype.ln = function () {
            this._line.writeln('');
            return this;
        };

        StyledOut.prototype.span = function (str) {
            this._line.write(this._style.plain(str));
            return this;
        };

        StyledOut.prototype.block = function (str) {
            this._line.writeln(this._style.plain(str));
            return this;
        };

        StyledOut.prototype.clear = function () {
            this._line.writeln('');
            this._line.writeln('');
            return this;
        };

        StyledOut.prototype.ruler = function (levels) {
            if (typeof levels === "undefined") { levels = 1; }
            var str = '';
            for (var i = 0; i < levels; i++) {
                str += this.nibs.ruler;
            }
            this._line.writeln(str);
            return this;
        };

        StyledOut.prototype.heading = function (str, level) {
            if (typeof level === "undefined") { level = 1; }
            this._line.writeln(this._style.accent(str));
            var l = Math.max(0, 3 - level);
            if (l > 0) {
                this.ruler(l);
            }
            return this;
        };

        StyledOut.prototype.plain = function (str) {
            this._line.writeln(this._style.plain(str));
            return this;
        };

        StyledOut.prototype.accent = function (str) {
            this._line.write(this._style.accent(str));
            return this;
        };

        StyledOut.prototype.muted = function (str) {
            this._line.write(this._style.muted(str));
            return this;
        };

        StyledOut.prototype.space = function () {
            this._line.write(this._style.plain(' '));
            return this;
        };

        StyledOut.prototype.sp = function () {
            this._line.write(this._style.plain(' '));
            return this;
        };

        StyledOut.prototype.success = function (str) {
            this._line.write(this._style.success(str));
            return this;
        };

        StyledOut.prototype.warning = function (str) {
            this._line.write(this._style.warning(str));
            return this;
        };

        StyledOut.prototype.error = function (str) {
            this._line.write(this._style.error(str));
            return this;
        };

        StyledOut.prototype.cond = function (condition, str, alt) {
            if (condition) {
                this._line.write(this._style.plain(str));
            } else if (arguments.length > 2) {
                this._line.write(this._style.plain(alt));
            }
            return this;
        };

        StyledOut.prototype.alt = function (str, alt) {
            if (xm.isValid(str) && !/^\s$/.test(str)) {
                this._line.write(this._style.plain(str));
            } else if (arguments.length > 1) {
                this._line.write(this._style.plain(alt));
            }
            return this;
        };

        StyledOut.prototype.inspect = function (value, depth, showHidden) {
            if (typeof depth === "undefined") { depth = 4; }
            if (typeof showHidden === "undefined") { showHidden = false; }
            this._line.writeln(this._style.plain(util.inspect(value, { showHidden: showHidden, depth: depth })));
            return this;
        };

        StyledOut.prototype.stringWrap = function (str) {
            this._line.write(this._style.plain(xm.wrapIfComplex(str)));
            return this;
        };

        StyledOut.prototype.glue = function (out) {
            return this;
        };

        StyledOut.prototype.swap = function (out) {
            return out;
        };

        StyledOut.prototype.label = function (label) {
            this._line.write(this._style.plain(xm.wrapIfComplex(label) + ': '));
            return this;
        };

        StyledOut.prototype.indent = function (levels) {
            if (typeof levels === "undefined") { levels = 1; }
            if (levels > 0) {
                var str = '';
                for (var i = 0; i < levels; i++) {
                    str += this.nibs.none;
                }
                this._line.write(str);
            }
            return this;
        };

        StyledOut.prototype.bullet = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.bullet));
            } else {
                this._line.write(this._style.plain(this.nibs.bullet));
            }
            return this;
        };

        StyledOut.prototype.index = function (num) {
            this._line.write(this._style.plain(String(num) + ': '));
            return this;
        };

        StyledOut.prototype.info = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.arrow));
            } else {
                this._line.write(this._style.plain(this.nibs.arrow));
            }
            return this;
        };

        StyledOut.prototype.report = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.double));
            } else {
                this._line.write(this._style.plain(this.nibs.double));
            }
            return this;
        };

        StyledOut.prototype.note = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.single));
            } else {
                this._line.write(this._style.plain(this.nibs.single));
            }
            return this;
        };

        StyledOut.prototype.shell = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.shell));
            } else {
                this._line.write(this._style.plain(this.nibs.shell));
            }
            return this;
        };

        StyledOut.prototype.dash = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.dash));
            } else {
                this._line.write(this._style.plain(this.nibs.dash));
            }
            return this;
        };

        StyledOut.prototype.edge = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._line.write(this._style.accent(this.nibs.edge));
            } else {
                this._line.write(this._style.plain(this.nibs.edge));
            }
            return this;
        };

        StyledOut.prototype.tweakURI = function (str, trimHttp, wrapAngles) {
            if (typeof trimHttp === "undefined") { trimHttp = false; }
            if (typeof wrapAngles === "undefined") { wrapAngles = false; }
            var repAccent = this._style.accent('/');

            if (wrapAngles) {
                this._line.write(this._style.muted('<'));
            }
            if (trimHttp) {
                this._line.write(str.replace(/^\w+?:\/\//, '').replace(/\//g, repAccent));
            } else {
                this._line.write(str.split(/:\/\//).map(function (str) {
                    return str.replace(/\//g, repAccent);
                }).join(this._style.accent('://')));
            }
            if (wrapAngles) {
                this._line.write(this._style.muted('>'));
            }
            return this;
        };

        StyledOut.prototype.tweakPath = function (str, muted) {
            if (typeof muted === "undefined") { muted = false; }
            return this.tweakExp(str, /\//g, muted);
        };

        StyledOut.prototype.tweakPunc = function (str, muted) {
            if (typeof muted === "undefined") { muted = false; }
            return this.tweakExp(str, /[\/\.,_-]/g, muted);
        };

        StyledOut.prototype.tweakBraces = function (str, muted) {
            if (typeof muted === "undefined") { muted = false; }
            return this.tweakExp(str, /[\[\{\(\<>\)\}\]]/g, muted);
        };

        StyledOut.prototype.tweakExp = function (str, expr, muted) {
            if (typeof muted === "undefined") { muted = false; }
            var _this = this;
            if (muted) {
                this._line.write(str.replace(expr, function (value) {
                    return _this._style.muted(value);
                }));
                return this;
            }
            this._line.write(str.replace(expr, function (value) {
                return _this._style.accent(value);
            }));
            return this;
        };

        StyledOut.prototype.unfunk = function () {
            this._line.flush();
            this._style = ministyle.plain();
            return this;
        };

        StyledOut.prototype.finalise = function () {
            this._line.flush();
        };

        StyledOut.prototype.useStyle = function (mini) {
            ministyle.assertMiniStyle(mini);
            this._style = mini;
            return this;
        };

        StyledOut.prototype.useWrite = function (mini) {
            miniwrite.assertMiniWrite(mini);
            this._line.useTarget(mini);
            return this;
        };

        StyledOut.prototype.getWrite = function () {
            return this._line;
        };

        StyledOut.prototype.getStyle = function () {
            return this._style;
        };
        return StyledOut;
    })();
    xm.StyledOut = StyledOut;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');

    xm.consoleOut = new xm.StyledOut();

    xm.log;

    var LogLevel = (function () {
        function LogLevel() {
        }
        LogLevel.ok = 'ok';
        LogLevel.log = 'log';
        LogLevel.warn = 'warn';
        LogLevel.error = 'error';
        LogLevel.debug = 'debug';
        LogLevel.status = 'status';
        return LogLevel;
    })();
    xm.LogLevel = LogLevel;

    function writeMulti(logger, args) {
        var ret = [];
        for (var i = 0, ii = args.length; i < ii; i++) {
            var value = args[i];
            if (value && typeof value === 'object') {
                ret.push(util.inspect(value, { showHidden: false, depth: 8 }));
            } else {
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

    function getLogger(label) {
        label = arguments.length > 0 ? (String(label) + ' ') : '';

        var plain = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                writeMulti(logger, args);
            }
        };

        var doLog = function (logger, args) {
            if (args.length > 0) {
                writeMulti(logger, args);
            }
        };

        var logger = (function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                plain.apply(null, args);
            }
        });
        logger.out = xm.consoleOut;
        logger.enabled = true;

        logger.log = plain;

        logger.ok = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                logger.out.span('-> ').success(label + 'ok ');
                doLog(logger, args);
            }
        };
        logger.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                logger.out.span('-> ').warning(label + 'warning ');
                doLog(logger, args);
            }
        };
        logger.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                logger.out.span('-> ').error(label + 'error ');
                doLog(logger, args);
            }
        };
        logger.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                logger.out.span('-> ').accent(label + 'debug ');
                doLog(logger, args);
            }
        };
        logger.status = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                logger.out.accent('-> ').span(label + ' ');
                doLog(logger, args);
            }
        };

        var map = Object.create(null);
        map[LogLevel.ok] = logger.ok;
        map['success'] = logger.ok;
        map[LogLevel.log] = logger.log;
        map[LogLevel.warn] = logger.warn;
        map['warning'] = logger.warn;
        map[LogLevel.error] = logger.error;
        map[LogLevel.debug] = logger.debug;
        map[LogLevel.status] = logger.status;

        logger.inspect = function (value, depth, label) {
            if (typeof depth === "undefined") { depth = 3; }
            if (logger.enabled) {
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').inspect(value, depth);
            }
        };
        logger.json = function (value, label) {
            if (logger.enabled) {
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').block(JSON.stringify(value, null, 3));
            }
        };

        logger.level = function (level) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            if (level in map) {
                map[level].apply(null, args);
            } else {
                logger.warn.apply(null, args);
            }
        };

        return logger;
    }
    xm.getLogger = getLogger;

    xm.log = getLogger();
    Object.defineProperty(xm, 'log', { writable: false });
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var childProcess = require('child_process');

    function runCLI(modulePath, args, debug, cwd) {
        if (typeof debug === "undefined") { debug = false; }
        if (typeof cwd === "undefined") { cwd = './'; }
        xm.assertVar(modulePath, 'string', 'modulePath');
        xm.assertVar(args, 'array', 'args');

        var d = Q.defer();

        var stdout = [];
        var stderr = [];

        var options = {
            silent: true
        };
        if (cwd) {
            options.cwd = cwd;
        }

        var getResult = function (code, err) {
            if (typeof code === "undefined") { code = 0; }
            if (typeof err === "undefined") { err = null; }
            var res = {
                code: code,
                error: err || null,
                stdout: Buffer.concat(stdout),
                stderr: Buffer.concat(stderr),
                args: args
            };
            if (debug && res.code > 0) {
                xm.log.debug(['node', modulePath, res.args.join(' ')].join(' '));
                xm.log.debug('error: ' + res.error);
                xm.log.debug('code: ' + res.code);
                xm.log(res.stdout.toString('utf8'));
                if (res.stderr.length) {
                    xm.log.error(res.stderr.toString('utf8'));
                }
            }
            return res;
        };

        args.unshift(modulePath);

        var child = childProcess.spawn('node', args, options);
        if (!child) {
            d.resolve(getResult(1, new Error('child spawned as null')));
            return d.promise;
        }

        child.stdout.on('data', function (chunk) {
            stdout.push(chunk);
            if (debug) {
                process.stdout.write(chunk);
            }
        });
        child.stderr.on('data', function (chunk) {
            stderr.push(chunk);
            if (debug) {
                process.stdout.write(chunk);
            }
        });

        child.on('error', function (err) {
            if (err) {
                xm.log.error('child process exited with code ' + err.code);
                xm.log.error(err);
            }

            d.resolve(getResult(1, err));
        });

        child.on('exit', function () {
            d.resolve(getResult(0, null));
        });

        return d.promise;
    }
    xm.runCLI = runCLI;
})(xm || (xm = {}));
(module).exports = function (grunt) {
    require('es6-shim');

    var lo_template = require('lodash-template');
    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');

    var templates = new Map();

    function slug(str) {
        str = str.replace(/[\|\[\]\(\)\<\>\{\}\!\\\/ ]/g, '-');
        str = str.replace(/(?:^\s+)|(?:[^a-zA-Z0-9 _-])|(?:\s+$)/g, '');
        str = str.replace(/--+/g, '--');
        return str;
    }

    function getTemplate(options) {
        xm.assertVar(options, 'object', 'src');

        var key;
        var tmp;

        if (options.template) {
            xm.assertVar(options.template, 'string', 'options.template');
            key = options.template;
            if (templates.has(key)) {
                return templates.get(key);
            }
            tmp = lo_template(grunt.file.read(options.template));
            templates.set(key, tmp);
            return tmp;
        }

        xm.assertVar(options.templateString, 'string', 'options.templateString');

        if (options.template) {
            key = options.template;
            if (templates.has(key)) {
                return templates.get(key);
            }
            tmp = lo_template(options.templateString);
            templates.set(key, tmp);
            return tmp;
        }
        return null;
    }

    grunt.registerMultiTask('capture_cli', function () {
        var options = this.options({
            modulePath: null,
            args: [],
            debug: false,
            cwd: null,
            name: null,
            templateString: '<%= capture %>',
            outDir: './tmp'
        });

        var done = this.async();

        xm.assertVar(options.modulePath, 'string', 'options.modulePath');

        xm.runCLI(options.modulePath, options.args, options.debug, options.cwd).then(function (cli) {
            xm.assertVar(cli, 'object', 'cli');

            var cliOut = cli.stdout.toString('utf8');

            var template = getTemplate(options);
            var wrapped = template({
                capture: cliOut,
                title: (options.title || options.name),
                args: options.args.join(' ')
            });

            var dest = path.resolve(options.outDir, options.name);
            if (options.debug) {
                grunt.log.writeln(wrapped);
            }
            grunt.log.writeln(dest);

            grunt.file.write(dest, wrapped);
        }).done(function () {
            done(true);
        }, function (err) {
            grunt.log.fail(err);
            done(false);
        });
    });
};
//# sourceMappingURL=capture_cli.js.map
