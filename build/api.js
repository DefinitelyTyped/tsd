var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');

    try  {
        require('source-map-support').install();

        Q.longStackSupport = true;
    } catch (e) {
    }

    require('bufferstream').fn.warn = false;

    require('es6-shim');

    if (!global.WeakMap) {
        global.WeakMap = require('weak-map');
    }

    process.setMaxListeners(20);
})(tsd || (tsd = {}));
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

    function isFlagOn(obj) {
        if (!xm.isValid(obj)) {
            return false;
        }
        obj = ('' + obj).toLowerCase();
        if (obj === '' || obj === '0') {
            return false;
        }
        switch (obj) {
            case 'false':
            case 'null':
            case 'nan':
            case 'undefined':

            case 'no':
            case 'off':
            case 'disabled':
                return false;
        }
        return true;
    }
    xm.isFlagOn = isFlagOn;

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

    function keysOf(map) {
        return toArray(map.keys());
    }
    xm.keysOf = keysOf;

    function valuesOf(map) {
        return toArray(map.values());
    }
    xm.valuesOf = valuesOf;

    function toArray(iterator) {
        var result = iterator.next();
        var ret = [];
        while (!result.done) {
            ret.push(result.value);
            result = iterator.next();
        }
        return ret;
    }
    xm.toArray = toArray;
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

    (function (_object) {
        function hasOwnProp(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        _object.hasOwnProp = hasOwnProp;

        function defineProp(object, property, settings) {
            Object.defineProperty(object, property, settings);
        }
        _object.defineProp = defineProp;

        function defineProps(object, propertyNames, settings) {
            propertyNames.forEach(function (property) {
                xm.object.defineProp(object, property, settings);
            });
        }
        _object.defineProps = defineProps;

        function hidePrefixed(object, ownOnly) {
            if (typeof ownOnly === "undefined") { ownOnly = true; }
            for (var property in object) {
                if (property.charAt(0) === '_' && (!ownOnly || xm.object.hasOwnProp(object, property))) {
                    xm.object.defineProp(object, property, { enumerable: false });
                }
            }
        }
        _object.hidePrefixed = hidePrefixed;

        function hideProps(object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { enumerable: false });
            });
        }
        _object.hideProps = hideProps;

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
        _object.lockProps = lockProps;

        function forceProps(object, props) {
            Object.keys(props).forEach(function (property) {
                Object.defineProperty(object, property, { value: props[property], writable: false });
            });
        }
        _object.forceProps = forceProps;

        function freezeProps(object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
                Object.freeze(object[property]);
            });
        }
        _object.freezeProps = freezeProps;

        function lockPrimitives(object) {
            Object.keys(object).forEach(function (property) {
                if (xm.isPrimitive(object[property])) {
                    Object.defineProperty(object, property, { writable: false });
                }
            });
        }
        _object.lockPrimitives = lockPrimitives;

        function deepFreeze(object) {
            if (xm.isObject(object) || xm.isArray(object)) {
                deepFreezeRecursive(object, []);
            }
        }
        _object.deepFreeze = deepFreeze;
    })(xm.object || (xm.object = {}));
    var object = xm.object;
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
            var _this = this;
            if (typeof muted === "undefined") { muted = false; }
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
                logger.out.accent('-> ').span(label + 'status ');
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
var tsd;
(function (tsd) {
    'use strict';

    tsd.Const = {
        rc: '.tsdrc',
        ident: 'tsd',
        configFile: 'tsd.json',
        typingsDir: 'typings',
        cacheDir: 'tsd-cache',
        bundleFile: 'tsd.d.ts',
        settings: 'settings.json',
        configVersion: 'v4',
        configSchemaFile: 'tsd-v4.json',
        definitelyRepo: 'borisyankov/DefinitelyTyped',
        mainBranch: 'master',
        statsDefault: true,
        shaShorten: 6
    };

    Object.freeze(tsd.Const);
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    function shaShort(sha) {
        if (!sha) {
            return '<no sha>';
        }
        return sha.substr(0, tsd.Const.shaShorten);
    }
    tsd.shaShort = shaShort;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var util = require('util');

    var Q = require('q');
    var FS = require('q-io/fs');
    var mkdirp = require('mkdirp');

    (function (_file) {
        function distributeDir(base, name, levels, chunk) {
            if (typeof chunk === "undefined") { chunk = 1; }
            name = name.replace(/(^[\\\/]+)|([\\\/]+$)/g, '');
            if (levels === 0) {
                return base;
            }
            if (chunk === 0) {
                return base;
            }
            var arr = [base];
            var steps = Math.max(0, Math.min(name.length - 2, levels * chunk));
            for (var i = 0; i < steps; i += chunk) {
                arr.push(name.substr(i, chunk));
            }
            return path.join.apply(path, arr);
        }
        _file.distributeDir = distributeDir;

        function parseJson(text) {
            var json;
            try  {
                json = JSON.parse(text);
            } catch (err) {
                if (err.name === 'SyntaxError') {
                    xm.log.error(err);
                    xm.log('---');
                    xm.log(text.substr(0, 1024));
                    xm.log('---');
                }

                throw (err);
            }
            return json;
        }
        _file.parseJson = parseJson;

        function readJSONSync(src) {
            return parseJson(fs.readFileSync(src, { encoding: 'utf8' }));
        }
        _file.readJSONSync = readJSONSync;

        function readJSON(src, callback) {
            fs.readFile(path.resolve(src), { encoding: 'utf8' }, function (err, text) {
                if (err || typeof text !== 'string') {
                    return callback(err, null);
                }
                var json = null;
                try  {
                    json = parseJson(text);
                } catch (err) {
                    return callback(err, null);
                }
                return callback(null, json);
            });
        }
        _file.readJSON = readJSON;

        function readJSONPromise(src) {
            return FS.read(src, { encoding: 'utf8' }).then(function (text) {
                return parseJson(text);
            });
        }
        _file.readJSONPromise = readJSONPromise;

        function writeJSONSync(dest, data) {
            dest = path.resolve(dest);
            xm.file.mkdirCheckSync(path.dirname(dest));
            fs.writeFileSync(dest, JSON.stringify(data, null, 2), { encoding: 'utf8' });
        }
        _file.writeJSONSync = writeJSONSync;

        function writeJSONPromise(dest, data) {
            var d = Q.defer();

            dest = path.resolve(dest);
            xm.file.mkdirCheckQ(path.dirname(dest), true).then(function (dest) {
                return FS.write(dest, JSON.stringify(data, null, 2), { encoding: 'utf8' });
            }).then(function () {
                d.resolve(null);
            }, d.reject);

            return d.promise;
        }
        _file.writeJSONPromise = writeJSONPromise;

        function readFileSync(dest, encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            return fs.readFileSync(dest, { encoding: encoding });
        }
        _file.readFileSync = readFileSync;

        function writeFileSync(dest, data, encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            dest = path.resolve(dest);
            xm.file.mkdirCheckSync(path.dirname(dest));
            fs.writeFileSync(dest, data, { encoding: encoding });
        }
        _file.writeFileSync = writeFileSync;

        function mkdirCheckSync(dir, writable, testWritable) {
            if (typeof writable === "undefined") { writable = false; }
            if (typeof testWritable === "undefined") { testWritable = false; }
            dir = path.resolve(dir);
            if (fs.existsSync(dir)) {
                if (!fs.statSync(dir).isDirectory()) {
                    throw (new Error('path exists but is not a directory: ' + dir));
                }
                if (writable) {
                    fs.chmodSync(dir, '744');
                }
            } else {
                if (writable) {
                    mkdirp.sync(dir, '744');
                } else {
                    mkdirp.sync(dir);
                }
            }
            if (testWritable) {
                var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');
                try  {
                    fs.writeFileSync(testFile, 'test');
                    fs.unlinkSync(testFile);
                } catch (e) {
                    throw new Error('no write access to: ' + dir + ' -> ' + e);
                }
            }
            return dir;
        }
        _file.mkdirCheckSync = mkdirCheckSync;

        function mkdirCheckQ(dir, writable, testWritable) {
            if (typeof writable === "undefined") { writable = false; }
            if (typeof testWritable === "undefined") { testWritable = false; }
            dir = path.resolve(dir);

            var d = Q.defer();

            FS.exists(dir).then(function (exists) {
                if (exists) {
                    return FS.isDirectory(dir).then(function (isDir) {
                        if (!isDir) {
                            throw (new Error('path exists but is not a directory: ' + dir));
                        }
                        if (writable) {
                            return FS.chmod(dir, '744');
                        }
                        return null;
                    });
                } else {
                    if (writable) {
                        return Q.nfcall(mkdirp, dir, '744');
                    }
                    return Q.nfcall(mkdirp, dir);
                }
            }).then(function () {
                if (testWritable) {
                    var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');

                    return FS.write(testFile, 'test').then(function () {
                        return FS.remove(testFile);
                    }).catch(function (err) {
                        throw new Error('no write access to: ' + dir + ' -> ' + err);
                    });
                }
            }).then(function () {
                d.resolve(dir);
            });
            return d.promise;
        }
        _file.mkdirCheckQ = mkdirCheckQ;

        function canWriteFile(targetPath, overwrite) {
            return FS.exists(targetPath).then(function (exists) {
                if (!exists) {
                    return Q(true);
                }
                return FS.isFile(targetPath).then(function (isFile) {
                    if (isFile) {
                        return overwrite;
                    }

                    return false;
                });
            });
        }
        _file.canWriteFile = canWriteFile;

        function removeFile(target) {
            var d = Q.defer();
            FS.exists(target).then(function (exists) {
                if (!exists) {
                    d.resolve();
                    return;
                }
                return FS.isFile(target).then(function (isFile) {
                    if (!isFile) {
                        throw new Error('not a file: ' + target);
                    }
                    return FS.remove(target).then(function () {
                        d.resolve();
                    });
                });
            }).fail(d.reject).done();

            return d.promise;
        }
        _file.removeFile = removeFile;

        function touchFile(src, atime, mtime) {
            var d = Q.defer();
            FS.stat(src).then(function (stat) {
                atime = (atime || new Date());
                mtime = (mtime || stat.node.mtime);
                return Q.nfcall(fs.utimes, src, atime, mtime);
            }).done(function () {
                d.resolve();
            }, d.reject);
            return d.promise;
        }
        _file.touchFile = touchFile;

        function findup(dir, name) {
            var d = Q.defer();
            if (dir === '/') {
                d.reject(new Error('could not find package.json up from: ' + dir));
                return;
            } else if (!dir || dir === '.') {
                d.reject(new Error('cannot find package.json from unspecified directory'));
                return;
            }
            var file = path.join(dir, name);
            FS.exists(file).then(function (exists) {
                if (exists) {
                    d.resolve(file);
                    return;
                }

                var dirName = path.dirname(dir);
                if (dirName === dir) {
                    d.reject(new Error('cannot find file: ' + name));
                    return;
                }
                return findup(path.dirname(dir), name).then(function (file) {
                    d.resolve(file);
                });
            }, d.reject);
            return d.promise;
        }
        _file.findup = findup;
    })(xm.file || (xm.file = {}));
    var file = xm.file;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function eachElem(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var i = 0, ii = collection.length; i < ii; i++) {
            if (callback.call(thisArg, collection[i], i, collection) === false) {
                return;
            }
        }
    }
    xm.eachElem = eachElem;

    function eachProp(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var prop in collection) {
            if (xm.hasOwnProp(collection, prop)) {
                if (callback.call(thisArg, collection[prop], prop, collection) === false) {
                    return;
                }
            }
        }
    }
    xm.eachProp = eachProp;

    function reduceArray(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var i = 0, ii = collection.length; i < ii; i++) {
            memo = callback.call(thisArg, memo, collection[i], i, collection);
        }
        return memo;
    }
    xm.reduceArray = reduceArray;

    function reduceHash(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var prop in collection) {
            if (xm.hasOwnProp(collection, prop)) {
                memo = callback.call(thisArg, memo, collection[prop], prop, collection);
            }
        }
        return memo;
    }
    xm.reduceHash = reduceHash;

    function mapArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for (var i = 0, ii = collection.length; i < ii; i++) {
            map[i] = callback.call(thisArg, collection[i], i, collection);
        }
        return map;
    }
    xm.mapArray = mapArray;

    function mapHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = {};
        for (var prop in collection) {
            if (xm.hasOwnProp(collection, prop)) {
                map[prop] = callback.call(thisArg, collection[prop], prop, collection);
            }
        }
        return map;
    }
    xm.mapHash = mapHash;

    function filterArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for (var i = 0, ii = collection.length; i < ii; i++) {
            if (callback.call(thisArg, collection[i], i, collection)) {
                map.push(collection[i]);
            }
        }
        return map;
    }
    xm.filterArray = filterArray;

    function filterHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var res = {};
        for (var prop in collection) {
            if (xm.hasOwnProp(collection, prop) && callback.call(thisArg, collection[prop], prop, collection)) {
                res[prop] = collection[prop];
            }
        }
        return res;
    }
    xm.filterHash = filterHash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var fs = require('fs');
    var path = require('path');

    function findInfo(pmodule, dir) {
        if (!dir) {
            dir = path.dirname(pmodule.filename);
        }

        var file = path.join(dir, 'package.json');
        if (fs.existsSync(file)) {
            return file;
        }

        if (dir === '/') {
            throw new Error('Could not find package.json up from: ' + dir);
        } else if (!dir || dir === '.') {
            throw new Error('Cannot find package.json from unspecified directory');
        }

        return findInfo(pmodule, path.dirname(dir));
    }

    var PackageJSON = (function () {
        function PackageJSON(pkg, path) {
            if (typeof path === "undefined") { path = null; }
            this.path = path;
            xm.assertVar(pkg, 'object', 'pkg');
            this._pkg = pkg;

            xm.object.hidePrefixed(this);
        }
        Object.defineProperty(PackageJSON.prototype, "raw", {
            get: function () {
                return this._pkg;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(PackageJSON.prototype, "name", {
            get: function () {
                return this._pkg.name || null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(PackageJSON.prototype, "description", {
            get: function () {
                return this._pkg.description || '';
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(PackageJSON.prototype, "version", {
            get: function () {
                return this._pkg.version || '0.0.0';
            },
            enumerable: true,
            configurable: true
        });

        PackageJSON.prototype.getNameVersion = function () {
            return this.name + ' ' + this.version;
        };

        PackageJSON.prototype.getKey = function () {
            return this.name + '-' + this.version;
        };

        PackageJSON.prototype.getHomepage = function (short) {
            if (typeof short === "undefined") { short = false; }
            var homepage = this._pkg.homepage;
            if (homepage) {
                if (short) {
                    return homepage.replace(/(^https?:\/\/)|(\/?$)/g, '');
                }
                return homepage;
            }
            if (short) {
                return '<no homepage>';
            }
            return '';
        };

        PackageJSON.find = function () {
            if (!PackageJSON._localPath) {
                PackageJSON._localPath = findInfo((module));
            }
            return PackageJSON._localPath;
        };

        PackageJSON.getLocal = function () {
            if (!PackageJSON._local) {
                var src = PackageJSON.find();
                if (!src) {
                    throw (new Error('cannot find local package.json'));
                }
                PackageJSON._local = new PackageJSON(xm.file.readJSONSync(src), src);
            }
            return PackageJSON._local;
        };
        return PackageJSON;
    })();
    xm.PackageJSON = PackageJSON;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var pointer = require('json-pointer');

    var JSONPointer = (function () {
        function JSONPointer(object, prefix) {
            if (typeof prefix === "undefined") { prefix = ''; }
            this.prefix = '';
            this.objects = object ? [object] : [];
            if (prefix && !/^\//.test(prefix)) {
                prefix = '/' + prefix;
            }
            this.prefix = prefix;
        }
        JSONPointer.prototype.hasValue = function (path) {
            if (!/^\//.test(path)) {
                path = '/' + path;
            }
            path = this.prefix + path;
            for (var i = 0, ii = this.objects.length; i < ii; i++) {
                if (pointer.has(this.objects[i], path)) {
                    return true;
                }
            }
            return false;
        };

        JSONPointer.prototype.getValue = function (path, alt) {
            if (typeof alt === "undefined") { alt = null; }
            if (!/^\//.test(path)) {
                path = '/' + path;
            }
            path = this.prefix + path;
            for (var i = 0, ii = this.objects.length; i < ii; i++) {
                var obj = this.objects[i];
                if (pointer.has(obj, path)) {
                    return pointer.get(obj, path);
                }
            }
            return alt;
        };

        JSONPointer.prototype.addSource = function (object) {
            this.objects.unshift(object);
        };

        JSONPointer.prototype.setValue = function (path, value) {
            if (!/^\//.test(path)) {
                path = '/' + path;
            }
            path = this.prefix + path;
            pointer.set(this.objects[0], path, value);
        };

        JSONPointer.prototype.getChild = function (path, alt) {
            if (typeof alt === "undefined") { alt = null; }
            if (!/^\//.test(path)) {
                path = '/' + path;
            }
            if (this.hasValue(path)) {
                var p = new JSONPointer();
                p.objects = this.objects.slice(0);
                p.prefix = this.prefix + path;
                return p;
            }
            return alt;
        };

        JSONPointer.prototype.getNumber = function (path, alt) {
            if (typeof alt === "undefined") { alt = NaN; }
            var value = this.getValue(path);
            if (typeof value === 'number') {
                return value;
            }
            return alt;
        };

        JSONPointer.prototype.getBoolean = function (path, alt) {
            if (typeof alt === "undefined") { alt = false; }
            return xm.isFlagOn(this.getValue(path, alt));
        };

        JSONPointer.prototype.getString = function (path, alt) {
            if (typeof alt === "undefined") { alt = null; }
            var value = this.getValue(path);
            if (typeof value === 'string') {
                return value;
            } else if (typeof value === 'number') {
                return String(value);
            }
            return alt;
        };

        JSONPointer.prototype.getDate = function (path, alt) {
            if (typeof alt === "undefined") { alt = null; }
            var value = this.getValue(path);
            if (typeof value === 'string' || typeof value === 'number') {
                return new Date(value);
            }
            return alt;
        };

        JSONPointer.prototype.getDurationSecs = function (path, alt) {
            if (typeof alt === "undefined") { alt = 0; }
            var value = this.getValue(path);
            if (typeof value === 'object') {
                var d = 0;
                if (typeof value.years === 'number') {
                    d += value.years * 31557600;
                }
                if (typeof value.months === 'number') {
                    d += value.months * 31557600 / 12;
                }
                if (typeof value.weeks === 'number') {
                    d += value.weeks * 7 * 24 * 3600;
                }
                if (typeof value.days === 'number') {
                    d += value.days * 24 * 3600;
                }
                if (typeof value.hours === 'number') {
                    d += value.hours * 3600;
                }
                if (typeof value.minutes === 'number') {
                    d += value.minutes * 60;
                }
                if (typeof value.seconds === 'number') {
                    d += value.seconds;
                }
                return d;
            }
            return alt;
        };
        return JSONPointer;
    })();
    xm.JSONPointer = JSONPointer;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var sniffExp = /([ \t]*).*((?:\r?\n)|$)/g;
    var lastEnd = /(\r?\n)$/;

    var detectIndent = require('detect-indent');

    var JSONStabilizer = (function () {
        function JSONStabilizer(depth, style) {
            if (typeof depth === "undefined") { depth = 2; }
            if (typeof style === "undefined") { style = null; }
            this.keys = [];
            this.parent = null;
            this.children = new Map();
            this.depth = depth;
            this.style = style || new CodeStyle();
        }
        Object.defineProperty(JSONStabilizer.prototype, "root", {
            get: function () {
                if (this.parent) {
                    return this.parent.root;
                }
                return this;
            },
            enumerable: true,
            configurable: true
        });

        JSONStabilizer.prototype.parseString = function (jsonString) {
            var object = JSON.parse(jsonString);
            this.style = new CodeStyle();
            this.sniff(jsonString);
            this.snapshot(object);
            return object;
        };

        JSONStabilizer.prototype.sniff = function (jsonString) {
            xm.assertVar(jsonString, 'string', 'jsonString');

            var eolWin = 0;
            var eolNix = 0;

            var sampleLines = 10;

            var match;
            sniffExp.lastIndex = 0;

            while (sampleLines > 0 && (match = sniffExp.exec(jsonString))) {
                sniffExp.lastIndex = match.index + (match[0].length || 1);
                sampleLines--;

                if (match[2].length > 0) {
                    if (match[2] === '\r\n') {
                        eolWin++;
                    } else {
                        eolNix++;
                    }
                }
            }

            this.style.trailingEOL = false;

            if (jsonString.length > 2) {
                lastEnd.lastIndex = 0;
                match = lastEnd.exec(jsonString);
                if (match && match[1].length > 0) {
                    this.style.trailingEOL = true;
                    if (match[1] === '\r\n') {
                        eolWin++;
                    } else {
                        eolNix++;
                    }
                }
            }

            this.style.indent = detectIndent(jsonString, '  ');
            this.style.eol = (eolWin > eolNix ? '\r\n' : '\n');
        };

        JSONStabilizer.prototype.snapshot = function (object) {
            var _this = this;
            xm.assertVar(object, 'object', 'object');

            this.keys = Object.keys(object);
            this.children = new Map();

            if (this.depth > 0) {
                this.keys.forEach(function (key) {
                    if (xm.isObject(object[key])) {
                        var child = new JSONStabilizer(_this.depth - 1);
                        child.parent = _this;
                        _this.children[key] = child;
                        child.snapshot(object[key]);
                    }
                });
            }
        };

        JSONStabilizer.prototype.getStablized = function (json) {
            var _this = this;
            xm.assertVar(json, 'object', 'json');

            var ret = {};
            var have = Object.keys(json);

            this.keys.forEach(function (key) {
                var i = have.indexOf(key);
                if (i > -1) {
                    have.splice(i, 1);
                    if (key in _this.children && xm.isObject(json[key])) {
                        ret[key] = _this.children[key].getStablized(json[key]);
                    } else {
                        ret[key] = json[key];
                    }
                }
            });
            have.forEach(function (key) {
                _this.keys.push(key);
                ret[key] = json[key];
            });

            return ret;
        };

        JSONStabilizer.prototype.toJSONString = function (json, assumeStable) {
            if (typeof assumeStable === "undefined") { assumeStable = false; }
            xm.assertVar(json, 'object', 'json');
            if (!assumeStable) {
                json = this.getStablized(json);
            }
            var str = JSON.stringify(json, null, this.style.indent);
            if (this.style.eol !== '\n') {
                str = str.replace(/\n/g, this.style.eol);
            }
            if (this.style.trailingEOL) {
                str += this.style.eol;
            }
            return str;
        };
        return JSONStabilizer;
    })();
    xm.JSONStabilizer = JSONStabilizer;

    var CodeStyle = (function () {
        function CodeStyle() {
            this.eol = '\n';
            this.indent = '  ';
            this.trailingEOL = true;
        }
        CodeStyle.prototype.clone = function () {
            var style = new CodeStyle();
            style.eol = this.eol;
            style.indent = this.indent;
            style.trailingEOL = this.trailingEOL;
            return style;
        };
        return CodeStyle;
    })();
    xm.CodeStyle = CodeStyle;

    var JSONStabilizerMap = (function () {
        function JSONStabilizerMap(depth, style) {
            if (typeof depth === "undefined") { depth = 2; }
            if (typeof style === "undefined") { style = null; }
            this.map = new WeakMap();
            this.depth = depth;
            this.style = style || new CodeStyle();
        }
        JSONStabilizerMap.prototype.parseString = function (jsonString) {
            var stable = new JSONStabilizer(this.depth, this.style.clone());
            this.map.set(xm.object, stable);
            return stable.parseString(jsonString);
        };

        JSONStabilizerMap.prototype.associate = function (object, snapshotNow) {
            if (typeof snapshotNow === "undefined") { snapshotNow = true; }
            var stable;
            if (!this.map.has(object)) {
                stable = new JSONStabilizer(this.depth, this.style.clone());
                this.map.set(object, stable);
            } else {
                stable = this.map.get(object);
            }
            if (snapshotNow) {
                stable.snapshot(object);
            }
            return stable;
        };

        JSONStabilizerMap.prototype.toJSONString = function (object) {
            var stable;
            if (!this.map.has(object)) {
                stable = new JSONStabilizer(this.depth, this.style.clone());
                this.map.set(object, stable);
                stable.snapshot(object);
            } else {
                stable = this.map.get(object);
            }
            return stable.toJSONString(object);
        };
        return JSONStabilizerMap;
    })();
    xm.JSONStabilizerMap = JSONStabilizerMap;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var semver = require('semver');

    var Def = (function () {
        function Def(path) {
            this.history = [];
            xm.assertVar(path, 'string', 'path');
            this.path = path;
        }
        Def.prototype.toString = function () {
            return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
        };

        Object.defineProperty(Def.prototype, "pathTerm", {
            get: function () {
                return this.path.replace(/\.d\.ts$/, '');
            },
            enumerable: true,
            configurable: true
        });

        Def.getPathExp = function (trim) {
            var useExp = (trim ? Def.nameExpEnd : Def.nameExp);
            useExp.lastIndex = 0;
            return useExp;
        };

        Def.getFileFrom = function (path) {
            var useExp = Def.getPathExp(true);
            var match = useExp.exec(path);
            if (!match) {
                return null;
            }
            return match[1] + '/' + match[2] + '.d.ts';
        };

        Def.isDefPath = function (path, trim) {
            if (typeof trim === "undefined") { trim = false; }
            if (Def.getPathExp(trim).test(path)) {
                Def.versionEnd.lastIndex = 0;
                var semMatch = Def.versionEnd.exec(path);
                if (!semMatch) {
                    return true;
                }
                var sem = semMatch[1];
                if (Def.twoNums.test(sem)) {
                    sem += '.0';
                }
                if (semMatch.length > 2) {
                    sem += semMatch[2];
                }
                return semver.valid(sem, true);
            }
            return false;
        };

        Def.getFrom = function (path, trim) {
            if (typeof trim === "undefined") { trim = false; }
            var useExp = Def.getPathExp(trim);

            var match = useExp.exec(path);
            if (!match) {
                return null;
            }
            if (match.length < 1) {
                return null;
            }
            if (match[1].length < 1 || match[2].length < 1) {
                return null;
            }
            var file = new tsd.Def(path);
            file.project = match[1];
            file.name = match[2];

            Def.versionEnd.lastIndex = 0;
            var semMatch = Def.versionEnd.exec(file.name);
            if (semMatch) {
                var sem = semMatch[1];

                if (Def.twoNums.test(sem)) {
                    sem += '.0';
                }
                if (semMatch.length > 2) {
                    sem += semMatch[2];
                }

                var valid = semver.valid(sem, true);
                if (valid) {
                    file.semver = valid;
                    file.name = file.name.substr(0, semMatch.index);
                } else {
                }
            }

            xm.object.lockProps(file, ['path', 'project', 'name', 'semver']);

            return file;
        };
        Def.nameExp = /^([\w\.-]*)\/([\w\.-]*)\.d\.ts$/;
        Def.nameExpEnd = /([\w\.-]*)\/([\w\.-]*)\.d\.ts$/;

        Def.versionEnd = /(?:-v?)(\d+(?:\.\d+)*)((?:-[a-z]+)?)$/i;
        Def.twoNums = /^\d+\.\d+$/;
        return Def;
    })();
    tsd.Def = Def;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var endSlashTrim = /\/?$/;
    var trim = /(^\s+)|(\s?\/?\s?$)/;

    var AuthorInfo = (function () {
        function AuthorInfo(name, url, email) {
            if (typeof name === "undefined") { name = ''; }
            if (typeof url === "undefined") { url = null; }
            if (typeof email === "undefined") { email = null; }
            this.name = name;
            this.url = url;
            this.email = email;
            if (this.url) {
                this.url = this.url.replace(trim, '');
            }
        }
        AuthorInfo.prototype.toString = function () {
            return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
        };

        AuthorInfo.prototype.toJSON = function () {
            var obj = {
                name: this.name
            };
            if (this.url) {
                obj.url = this.url;
            }
            if (this.email) {
                obj.email = this.email;
            }
            return obj;
        };
        return AuthorInfo;
    })();
    xm.AuthorInfo = AuthorInfo;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var DefInfo = (function () {
        function DefInfo() {
            this.references = [];
            this.resetAll();
        }
        DefInfo.prototype.resetFields = function () {
            this.name = '';
            this.version = '';
            this.description = '';
            this.projectUrl = '';

            this.authors = [];

            this.reposUrl = '';
        };

        DefInfo.prototype.resetAll = function () {
            this.resetFields();

            this.references = [];
        };

        DefInfo.prototype.toString = function () {
            return this.name;
        };

        DefInfo.prototype.isValid = function () {
            if (!this.name) {
                return false;
            }

            return true;
        };
        return DefInfo;
    })();
    tsd.DefInfo = DefInfo;
})(tsd || (tsd = {}));
var git;
(function (git) {
    'use strict';

    var crypto = require('crypto');

    (function (GitUtil) {
        function decodeBlobJson(blobJSON) {
            if (!blobJSON || !blobJSON.encoding) {
                return null;
            }
            switch (blobJSON.encoding) {
                case 'base64':
                    return new Buffer(blobJSON.content, 'base64');
                case 'utf-8':
                case 'utf8':
                default:
                    return new Buffer(blobJSON.content, 'utf8');
            }
        }
        GitUtil.decodeBlobJson = decodeBlobJson;

        function blobShaHex(data) {
            xm.assertVar(data, Buffer, 'data');
            return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
        }
        GitUtil.blobShaHex = blobShaHex;
    })(git.GitUtil || (git.GitUtil = {}));
    var GitUtil = git.GitUtil;
})(git || (git = {}));
var tsd;
(function (tsd) {
    'use strict';

    var DefBlob = (function () {
        function DefBlob(sha, content, encoding) {
            if (typeof content === "undefined") { content = null; }
            if (typeof encoding === "undefined") { encoding = null; }
            this.sha = null;
            this.content = null;
            this.encoding = 'utf8';
            xm.assertVar(sha, 'sha1', 'sha');
            this.sha = sha;
            this.encoding = encoding;

            xm.object.defineProps(this, ['sha', 'encoding'], { writable: false });

            if (content) {
                this.setContent(content);
            } else {
                Object.defineProperty(this, 'content', { enumerable: false });
            }
        }
        DefBlob.prototype.hasContent = function () {
            return xm.isValid(this.content);
        };

        DefBlob.prototype.setContent = function (content, encoding) {
            xm.assertVar(content, Buffer, 'content');
            if (xm.isValid(this.content)) {
                throw new Error('content already set: ' + this.sha);
            }

            var sha = git.GitUtil.blobShaHex(content);
            if (sha !== this.sha) {
                xm.throwAssert('blob sha mismatch: ' + sha + ' != ' + this.sha, sha, this.sha);
            }

            xm.object.defineProp(this, 'content', { writable: true });
            this.content = content;
            xm.object.defineProp(this, 'content', { writable: false, enumerable: false });
        };

        Object.defineProperty(DefBlob.prototype, "shaShort", {
            get: function () {
                return this.sha ? tsd.shaShort(this.sha) : '<no sha>';
            },
            enumerable: true,
            configurable: true
        });

        DefBlob.prototype.toString = function () {
            return this.shaShort;
        };
        return DefBlob;
    })();
    tsd.DefBlob = DefBlob;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var DefVersion = (function () {
        function DefVersion(def, commit) {
            this._def = null;
            this._commit = null;
            this._blob = null;
            this.dependencies = [];
            this.solved = false;
            xm.assertVar(def, tsd.Def, 'def');
            xm.assertVar(commit, tsd.DefCommit, 'commit');

            this._def = def;
            this._commit = commit;

            xm.object.hidePrefixed(this);
        }
        DefVersion.prototype.setContent = function (blob) {
            xm.assertVar(blob, tsd.DefBlob, 'blob');
            if (this._blob) {
                throw new Error('already got a blob: ' + this._blob.sha + ' != ' + blob.sha);
            }
            this._blob = blob;
        };

        DefVersion.prototype.hasContent = function () {
            return (this._blob && this._blob.hasContent());
        };

        Object.defineProperty(DefVersion.prototype, "key", {
            get: function () {
                if (!this._def || !this._commit) {
                    return null;
                }
                return this._def.path + '-' + this._commit.commitSha;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefVersion.prototype, "def", {
            get: function () {
                return this._def;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefVersion.prototype, "commit", {
            get: function () {
                return this._commit;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefVersion.prototype, "blob", {
            get: function () {
                return this._blob;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefVersion.prototype, "blobShaShort", {
            get: function () {
                return this._blob ? this._blob.shaShort : '<no blob>';
            },
            enumerable: true,
            configurable: true
        });

        DefVersion.prototype.toString = function () {
            var str = '';
            str += (this._def ? this._def.path : '<no def>');
            str += ' : ' + (this._commit ? this._commit.commitShort : '<no commit>');
            str += ' : ' + (this._blob ? this._blob.shaShort : '<no blob>');
            return str;
        };
        return DefVersion;
    })();
    tsd.DefVersion = DefVersion;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var tv4 = require('tv4');
    var reporter = require('tv4-reporter');

    var InstalledDef = (function () {
        function InstalledDef(path) {
            if (path) {
                xm.assertVar(path, 'string', 'path');
                this.path = path;
            }
        }
        InstalledDef.prototype.update = function (file) {
            xm.assertVar(file, tsd.DefVersion, 'file');

            xm.assertVar(file.commit, tsd.DefCommit, 'commit');
            xm.assertVar(file.commit.commitSha, 'sha1', 'commit.sha');

            this.path = file.def.path;
            this.commitSha = file.commit.commitSha;
        };

        InstalledDef.prototype.toString = function () {
            return this.path;
        };
        return InstalledDef;
    })();
    tsd.InstalledDef = InstalledDef;

    var Config = (function () {
        function Config(schema) {
            this._installed = new Map();
            this._stable = new xm.JSONStabilizer();
            this.log = xm.getLogger('Config');
            xm.assertVar(schema, 'object', 'schema');
            xm.assert((schema.version !== tsd.Const.configVersion), 'bad schema config version', schema.version, tsd.Const.configVersion, true);

            this._schema = schema;

            this.reset();

            xm.object.hidePrefixed(this);
            Object.defineProperty(this, 'log', { enumerable: false });
        }
        Config.prototype.reset = function () {
            this.path = tsd.Const.typingsDir;
            this.version = tsd.Const.configVersion;
            this.repo = tsd.Const.definitelyRepo;
            this.ref = tsd.Const.mainBranch;
            this.stats = tsd.Const.statsDefault;

            this.bundle = tsd.Const.typingsDir + '/' + tsd.Const.bundleFile;

            this._installed.clear();
        };

        Config.prototype.resolveTypingsPath = function (relativeToDir) {
            var cfgFull = path.resolve(relativeToDir);
            var typings = this.path.replace(/[\\\/]/g, path.sep);

            if (/^([\\\/]|\w:)/.test(this.path)) {
                return typings;
            }

            return path.resolve(cfgFull, typings);
        };

        Object.defineProperty(Config.prototype, "repoOwner", {
            get: function () {
                return this.repo.split('/')[0];
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Config.prototype, "repoProject", {
            get: function () {
                return this.repo.split('/')[1];
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Config.prototype, "repoRef", {
            get: function () {
                return this.repo + '#' + this.ref;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Config.prototype, "schema", {
            get: function () {
                return this._schema;
            },
            enumerable: true,
            configurable: true
        });

        Config.prototype.addFile = function (file) {
            xm.assertVar(file, tsd.DefVersion, 'file');

            var def;
            if (this._installed.has(file.def.path)) {
                def = this._installed.get(file.def.path);
            } else {
                def = new tsd.InstalledDef(file.def.path);
            }
            def.update(file);

            this._installed.set(file.def.path, def);
        };

        Config.prototype.hasFile = function (filePath) {
            xm.assertVar(filePath, 'string', 'filePath');
            return this._installed.has(filePath);
        };

        Config.prototype.getFile = function (filePath) {
            xm.assertVar(filePath, 'string', 'filePath');
            return this._installed.has(filePath) ? this._installed.get(filePath) : null;
        };

        Config.prototype.removeFile = function (filePath) {
            xm.assertVar(filePath, 'string', 'filePath');
            this._installed.delete(filePath);
        };

        Config.prototype.getInstalled = function () {
            return xm.valuesOf(this._installed);
        };

        Config.prototype.getInstalledPaths = function () {
            return xm.valuesOf(this._installed).map(function (value) {
                return value.path;
            });
        };

        Config.prototype.toJSON = function () {
            var json = {
                version: this.version,
                repo: this.repo,
                ref: this.ref,
                path: this.path
            };
            if (this.bundle) {
                json.bundle = this.bundle;
            }
            if (this.stats !== tsd.Const.statsDefault) {
                json.stats = this.stats;
            }
            json.installed = {};

            this._installed.forEach(function (file, key) {
                json.installed[file.path] = {
                    commit: file.commitSha
                };
            });

            this.validateJSON(json, this._schema);

            return json;
        };

        Config.prototype.toJSONString = function () {
            return this._stable.toJSONString(this.toJSON(), false);
        };

        Config.prototype.parseJSONString = function (input, label, log) {
            if (typeof log === "undefined") { log = true; }
            xm.assertVar(input, 'string', 'input');
            this.parseJSON(this._stable.parseString(input));
        };

        Config.prototype.parseJSON = function (json, label, log) {
            var _this = this;
            if (typeof log === "undefined") { log = true; }
            xm.assertVar(json, 'object', 'json');

            this.validateJSON(json, this._schema, label, log);

            this._installed.clear();

            this.path = json.path;
            this.version = json.version;
            this.repo = json.repo;
            this.ref = json.ref;
            this.bundle = json.bundle;
            this.stats = (xm.isBoolean(json.stats) ? json.stats : tsd.Const.statsDefault);

            if (json.installed) {
                xm.eachProp(json.installed, function (data, filePath) {
                    var installed = new tsd.InstalledDef(filePath);

                    installed.commitSha = data.commit;
                    _this._installed.set(filePath, installed);
                });
            }
        };

        Config.prototype.validateJSON = function (json, schema, label, log) {
            if (typeof log === "undefined") { log = true; }
            xm.assertVar(schema, 'object', 'schema');

            label = (label || '<config json>');
            var res = tv4.validateMultiple(json, schema);
            if (!res.valid || res.missing.length > 0) {
                if (log) {
                    xm.log.out.ln();
                    var report = reporter.getReporter(xm.log.out.getWrite(), xm.log.out.getStyle());
                    report.reportResult(report.createTest(schema, json, label, res, true), '   ');
                    xm.log.out.ln();
                }
                throw (new Error('malformed config: doesn\'t comply with schema'));
            }
            return json;
        };
        return Config;
    })();
    tsd.Config = Config;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');

    var Paths = (function () {
        function Paths() {
            this.startCwd = path.resolve(process.cwd());
            this.configFile = path.resolve(this.startCwd, tsd.Const.configFile);
            this.cacheDir = path.resolve(this.startCwd, tsd.Const.cacheDir);
        }
        Paths.getCacheDirName = function () {
            return (process.platform === 'win32' ? tsd.Const.cacheDir : '.' + tsd.Const.cacheDir);
        };

        Paths.getUserHome = function () {
            return (process.env.HOME || process.env.USERPROFILE);
        };

        Paths.getUserRoot = function () {
            return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
        };

        Paths.getUserCacheDir = function () {
            return path.resolve(Paths.getUserRoot(), Paths.getCacheDirName());
        };
        return Paths;
    })();
    tsd.Paths = Paths;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var fs = require('fs');
    var path = require('path');

    var Context = (function () {
        function Context(configFile, verbose) {
            if (typeof configFile === "undefined") { configFile = null; }
            if (typeof verbose === "undefined") { verbose = false; }
            xm.assertVar(configFile, 'string', 'configFile', true);
            xm.assertVar(verbose, 'boolean', 'verbose');

            this.packageInfo = xm.PackageJSON.getLocal();
            this.settings = new xm.JSONPointer(xm.file.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'conf', 'settings.json')));

            this.stackSettings(path.resolve(tsd.Paths.getUserHome(), tsd.Const.rc));
            this.stackSettings(path.resolve(process.cwd(), tsd.Const.rc));

            this.verbose = verbose;

            this.paths = new tsd.Paths();
            if (configFile) {
                this.paths.configFile = path.resolve(configFile);
            }
            this.paths.cacheDir = tsd.Paths.getUserCacheDir();

            this.configSchema = xm.file.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));
            this.config = new tsd.Config(this.configSchema);
        }
        Context.prototype.stackSettings = function (src) {
            if (fs.existsSync(src)) {
                if (this.verbose) {
                    xm.log.status('using rc: ' + src);
                }
                this.settings.addSource(xm.file.readJSONSync(src));
            } else {
                if (this.verbose) {
                    xm.log.status('cannot find rc: ' + src);
                }
            }
        };

        Context.prototype.getTypingsDir = function () {
            return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
        };

        Context.prototype.getInfo = function (details) {
            if (typeof details === "undefined") { details = false; }
            var info = {
                version: this.packageInfo.getNameVersion(),
                repo: 'http://github.com/' + this.config.repo + ' #' + this.config.ref
            };
            if (details) {
                info.paths = this.paths;
                info.typings = this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
                info.config = this.config.toJSON();
            }
            return info;
        };
        return Context;
    })();
    tsd.Context = Context;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var expTrim = /^\/(.*)\/([a-z]+)*$/gm;
    var flagFilter = /[gim]/;

    var RegExpGlue = (function () {
        function RegExpGlue() {
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            this.parts = [];
            if (exp.length > 0) {
                this.append.apply(this, exp);
            }
        }
        RegExpGlue.get = function () {
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            var e = new RegExpGlue();
            return e.append.apply(e, exp);
        };

        RegExpGlue.escapeChars = function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        };

        RegExpGlue.prototype.append = function () {
            var _this = this;
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            exp.forEach(function (value) {
                _this.parts.push(value);
            }, this);
            return this;
        };

        RegExpGlue.prototype.getBody = function (exp) {
            expTrim.lastIndex = 0;
            var trim = expTrim.exec('' + exp);
            if (!trim) {
                return '';
            }
            return typeof trim[1] !== 'undefined' ? trim[1] : '';
        };

        RegExpGlue.prototype.getFlags = function (exp) {
            expTrim.lastIndex = 0;
            var trim = expTrim.exec('' + exp);
            if (!trim) {
                return '';
            }
            return typeof trim[2] !== 'undefined' ? this.getCleanFlags(trim[2]) : '';
        };

        RegExpGlue.prototype.getCleanFlags = function (flags) {
            var ret = '';
            for (var i = 0; i < flags.length; i++) {
                var char = flags.charAt(i);
                if (flagFilter.test(char) && ret.indexOf(char) < 0) {
                    ret += char;
                }
            }
            return ret;
        };

        RegExpGlue.prototype.join = function (flags, seperator) {
            var glueBody = seperator ? this.getBody(seperator) : '';
            var chunks = [];

            flags = typeof flags !== 'undefined' ? this.getCleanFlags(flags) : '';

            this.parts.forEach(function (exp, index, arr) {
                if (typeof exp === 'string') {
                    chunks.push(exp);
                    return;
                }
                expTrim.lastIndex = 0;
                var trim = expTrim.exec('' + exp);
                if (!trim) {
                    return exp;
                }
                if (trim.length < 2) {
                    console.log(trim);
                    return;
                }
                chunks.push(trim[1]);
            }, this);

            return new RegExp(chunks.join(glueBody), flags);
        };
        return RegExpGlue;
    })();
    xm.RegExpGlue = RegExpGlue;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var wordParts = /[\w_\.-]/;
    var wordGreedy = /[\w_\.-]+/;
    var wordLazy = /[\w_\.-]*?/;
    var wordGlob = /(\**)([\w_\.-]*?)(\**)/;

    var patternSplit = xm.RegExpGlue.get('^', wordGlob, '/', wordGlob, '$').join();
    var patternSingle = xm.RegExpGlue.get('^', wordGlob, '$').join();

    function escapeRegExpChars(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
    }

    var NameMatcher = (function () {
        function NameMatcher(pattern) {
            xm.assertVar(pattern, 'string', 'pattern');
            this.pattern = pattern;
        }
        NameMatcher.prototype.filter = function (list, current) {
            return list.filter(this.getFilterFunc(current));
        };

        NameMatcher.prototype.toString = function () {
            return this.pattern;
        };

        NameMatcher.prototype.compile = function () {
            if (!this.pattern) {
                throw (new Error('NameMatcher undefined pattern'));
            }
            this.projectExp = null;
            this.nameExp = null;

            if (this.pattern.indexOf('/') > -1) {
                this.compileSplit();
            } else {
                this.compileSingle();
            }
        };

        NameMatcher.prototype.compileSingle = function () {
            patternSingle.lastIndex = 0;
            var match = patternSingle.exec(this.pattern);

            if (match.length < 4) {
                throw (new Error('NameMatcher bad match: "' + match + '"'));
            }
            var glue;

            var gotMatch = false;
            glue = xm.RegExpGlue.get('^');
            if (match[1].length > 0) {
                glue.append(wordLazy);
                gotMatch = true;
            }
            if (match[2].length > 0) {
                glue.append(escapeRegExpChars(match[2]));
                gotMatch = true;
            }
            if (match[3].length > 0) {
                glue.append(wordLazy);
                gotMatch = true;
            }
            if (gotMatch) {
                glue.append('$');
                this.nameExp = glue.join('i');
            }
        };

        NameMatcher.prototype.compileSplit = function () {
            patternSplit.lastIndex = 0;
            var match = patternSplit.exec(this.pattern);

            if (match.length < 7) {
                throw (new Error('NameMatcher bad match: "' + match + '"'));
            }
            var glue;

            var gotProject = false;
            glue = xm.RegExpGlue.get('^');
            if (match[1].length > 0) {
                glue.append(wordLazy);
            }
            if (match[2].length > 0) {
                glue.append(escapeRegExpChars(match[2]));
                gotProject = true;
            }
            if (match[3].length > 0) {
                glue.append(wordLazy);
            }
            if (gotProject) {
                glue.append('$');
                this.projectExp = glue.join('i');
            }

            var gotFile = false;
            glue = xm.RegExpGlue.get('^');
            if (match[4].length > 0) {
                glue.append(wordLazy);
            }
            if (match[5].length > 0) {
                glue.append(escapeRegExpChars(match[5]));
                gotFile = true;
            }
            if (match[6].length > 0) {
                glue.append(wordLazy);
            }
            if (gotFile) {
                glue.append('$');
                this.nameExp = glue.join('i');
            }
        };

        NameMatcher.prototype.getFilterFunc = function (current) {
            var _this = this;
            this.compile();

            if (this.nameExp) {
                if (this.projectExp) {
                    return function (file) {
                        return _this.projectExp.test(file.project) && _this.nameExp.test(file.name);
                    };
                } else {
                    return function (file) {
                        return _this.nameExp.test(file.name);
                    };
                }
            } else if (this.projectExp) {
                return function (file) {
                    return _this.projectExp.test(file.name);
                };
            } else {
                throw (new Error('NameMatcher cannot compile pattern: ' + JSON.stringify(this.pattern) + ''));
            }
        };
        return NameMatcher;
    })();
    tsd.NameMatcher = NameMatcher;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var InfoMatcher = (function () {
        function InfoMatcher() {
        }
        InfoMatcher.prototype.filter = function (list) {
            return list;
        };
        return InfoMatcher;
    })();
    tsd.InfoMatcher = InfoMatcher;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    function pad(input) {
        var r = String(input);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    (function (_date) {
        function getISOString(input) {
            var date;
            if (xm.isDate(input)) {
                date = input;
            } else if (xm.isString(input) || xm.isNumber(input)) {
                date = new Date(input);
            }
            return (date ? date.toISOString() : null);
        }
        _date.getISOString = getISOString;

        function toNiceUTC(date) {
            return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate()) + ' ' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes());
        }
        _date.toNiceUTC = toNiceUTC;

        function isBeforeDate(actual, base) {
            return actual.getUTCFullYear() < base.getUTCFullYear() || actual.getUTCMonth() < base.getUTCMonth() || actual.getUTCDate() < base.getUTCDate();
        }
        _date.isBeforeDate = isBeforeDate;

        function isAfterDate(actual, base) {
            return actual.getUTCFullYear() > base.getUTCFullYear() || actual.getUTCMonth() > base.getUTCMonth() || actual.getUTCDate() > base.getUTCDate();
        }
        _date.isAfterDate = isAfterDate;

        function isEqualDate(actual, base) {
            return actual.toDateString() === base.toDateString();
        }
        _date.isEqualDate = isEqualDate;

        function compare(date1, date2) {
            return date1.getTime() - date2.getTime();
        }
        _date.compare = compare;
    })(xm.date || (xm.date = {}));
    var date = xm.date;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var termExp = /(>=?|<=?|==) *(\d+[\d:;_ \-]+\d)/g;

    var comparators = {
        '<=': function lte(date1, date2) {
            return xm.date.isBeforeDate(date1, date2) || xm.date.isEqualDate(date1, date2);
        },
        '<': xm.date.isBeforeDate,
        '>=': function gte(date1, date2) {
            return xm.date.isAfterDate(date1, date2) || xm.date.isEqualDate(date1, date2);
        },
        '>': xm.date.isAfterDate,
        '==': xm.date.isEqualDate
    };

    var DateComp = (function () {
        function DateComp() {
        }
        DateComp.prototype.satisfies = function (date) {
            return this.comparator(date, this.date);
        };
        return DateComp;
    })();
    tsd.DateComp = DateComp;

    var DateMatcher = (function () {
        function DateMatcher(pattern) {
            this.comparators = [];
            if (pattern) {
                this.extractSelector(pattern);
            }
        }
        DateMatcher.prototype.filter = function (list) {
            if (this.comparators.length === 0) {
                return list;
            }
            return list.filter(this.getFilterFunc());
        };

        DateMatcher.prototype.best = function (list) {
            return this.latest(this.filter(list));
        };

        DateMatcher.prototype.latest = function (list) {
            if (this.comparators.length > 0) {
                var list = this.filter(list).sort(tsd.DefUtil.fileCommitCompare);
                if (list.length > 0) {
                    return list[list.length - 1];
                }
            }
            return null;
        };

        DateMatcher.prototype.extractSelector = function (pattern) {
            xm.assertVar(pattern, 'string', 'pattern');
            this.comparators = [];
            if (!pattern) {
                return;
            }

            termExp.lastIndex = 0;
            var match;
            while ((match = termExp.exec(pattern))) {
                termExp.lastIndex = match.index + match[0].length;
                xm.assert(xm.hasOwnProp(comparators, match[1]), 'not a valid date comparator in filter {a}', match[0]);

                var comp = new DateComp();

                comp.date = new Date(match[2].replace(/;_/g, ' '));
                if (!comp.date) {
                    xm.throwAssert('not a valid date in filter {a}', match[0]);
                }
                comp.operator = match[1];
                comp.comparator = comparators[match[1]];
                this.comparators.push(comp);
            }
        };

        DateMatcher.prototype.getFilterFunc = function () {
            var _this = this;
            var len = this.comparators.length;
            return function (file) {
                var date = file.commit.changeDate;
                if (!date) {
                    return false;
                }
                for (var i = 0; i < len; i++) {
                    if (!_this.comparators[i].satisfies(date)) {
                        return false;
                    }
                }
                return true;
            };
        };
        return DateMatcher;
    })();
    tsd.DateMatcher = DateMatcher;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var semver = require('semver');

    var intMax = Math.pow(2, 53);
    var semverMax = 'v' + intMax + '.' + intMax + '.' + intMax;
    var semverMin = 'v' + 0 + '.' + 0 + '.' + 0;

    var VersionMatcher = (function () {
        function VersionMatcher(range) {
            if (range === VersionMatcher.latest || range === VersionMatcher.all) {
                this.range = range;
            } else if (range) {
                this.range = semver.validRange(range, true);
                if (!this.range) {
                    xm.throwAssert('expected {a} to be a valid semver-range', range);
                }
            } else {
                this.range = VersionMatcher.latest;
            }
        }
        VersionMatcher.prototype.filter = function (list) {
            var _this = this;
            if (!this.range || this.range === VersionMatcher.all) {
                return list.slice(0);
            }

            var map = list.reduce(function (map, def) {
                var id = def.project + '/' + def.name;
                if (id in map) {
                    map[id].push(def);
                } else {
                    map[id] = [def];
                }
                return map;
            }, Object.create(null));

            if (this.range === VersionMatcher.latest) {
                return Object.keys(map).map(function (key) {
                    return _this.getLatest(map[key]);
                });
            }

            return Object.keys(map).reduce(function (memo, key) {
                map[key].forEach(function (def) {
                    if (!def.semver) {
                        if (semver.satisfies(semverMax, _this.range)) {
                            memo.push(def);
                        }
                    } else if (semver.satisfies(def.semver, _this.range)) {
                        memo.push(def);
                    }
                });
                return memo;
            }, []);
        };

        VersionMatcher.prototype.getLatest = function (list) {
            var latest;
            for (var i = 0, ii = list.length; i < ii; i++) {
                var def = list[i];
                if (!def.semver) {
                    return def;
                } else if (!latest) {
                    latest = def;
                } else if (semver.gt(def.semver, latest.semver)) {
                    xm.log('VersionMatcher.filter', 'gt', def.semver, latest.semver);
                    latest = def;
                }
            }
            return latest;
        };
        VersionMatcher.latest = 'latest';
        VersionMatcher.all = 'all';
        return VersionMatcher;
    })();
    tsd.VersionMatcher = VersionMatcher;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var fullSha = /^[0-9a-f]{40}$/;
    var hex = /^[0-9a-f]+$/;

    var CommitMatcher = (function () {
        function CommitMatcher(commitSha) {
            this.minimumShaLen = 2;
            if (commitSha) {
                this.commitSha = String(commitSha).toLowerCase();
            }
        }
        CommitMatcher.prototype.filter = function (list) {
            if (!this.commitSha) {
                return list;
            }
            return list.filter(this.getFilterFunc(this.commitSha));
        };

        CommitMatcher.prototype.getFilterFunc = function (commitSha) {
            if (fullSha.test(commitSha)) {
                return function (file) {
                    return (file.commit && file.commit.commitSha === commitSha);
                };
            }

            if (!hex.test(commitSha)) {
                xm.throwAssert('parameter not a hex {a}', commitSha);
            }
            var len = commitSha.length;
            if (len < this.minimumShaLen) {
                xm.throwAssert('parameter hex too short {a}, {e}', this.minimumShaLen, false);
            }
            return function (file) {
                return (file.commit && file.commit.commitSha.substr(0, len) === commitSha);
            };
        };
        return CommitMatcher;
    })();
    tsd.CommitMatcher = CommitMatcher;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Query = (function () {
        function Query(pattern) {
            this.patterns = [];
            this.parseInfo = false;
            this.loadHistory = false;
            xm.assertVar(pattern, 'string', 'pattern', true);
            if (pattern) {
                this.patterns.push(new tsd.NameMatcher(pattern));
            }
        }
        Query.prototype.addNamePattern = function (pattern) {
            xm.assertVar(pattern, 'string', 'pattern');
            this.patterns.push(new tsd.NameMatcher(pattern));
        };

        Object.defineProperty(Query.prototype, "requiresSource", {
            get: function () {
                return !!(this.infoMatcher || this.parseInfo);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Query.prototype, "requiresHistory", {
            get: function () {
                return !!(this.dateMatcher || this.commitMatcher || this.loadHistory);
            },
            enumerable: true,
            configurable: true
        });

        Query.prototype.toString = function () {
            return this.patterns.reduce(function (memo, matcher) {
                memo.push(matcher.pattern);
                return memo;
            }, []).join(', ');
        };
        return Query;
    })();
    tsd.Query = Query;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var uriTemplates = require('uri-templates');

    var URLManager = (function () {
        function URLManager(common) {
            this._templates = Object.create(null);
            this._vars = Object.create(null);
            if (common) {
                this.setVars(common);
            }
        }
        URLManager.prototype.addTemplate = function (id, url) {
            if (id in this._templates) {
                throw (new Error('cannot redefine template: ' + id));
            }
            this._templates[id] = uriTemplates(url);
        };

        URLManager.prototype.setVar = function (id, value) {
            this._vars[id] = value;
        };

        URLManager.prototype.getVar = function (id) {
            return (id in this._vars ? this._vars[id] : null);
        };

        URLManager.prototype.setVars = function (map) {
            var _this = this;
            Object.keys(map).forEach(function (id) {
                if (xm.isValid(map[id])) {
                    _this._vars[id] = map[id];
                } else {
                    delete _this._vars[id];
                }
            });
        };

        URLManager.prototype.getTemplate = function (id) {
            if (id in this._templates) {
                return this._templates[id];
            }
            throw (new Error('undefined url template: ' + id));
        };

        URLManager.prototype.getURL = function (id, vars) {
            if (vars) {
                var obj = Object.create(this._vars);
                Object.keys(vars).forEach(function (id) {
                    if (xm.isValid(vars[id])) {
                        obj[id] = vars[id];
                    }
                });
                return this.getTemplate(id).fillFromObject(obj);
            }
            return this.getTemplate(id).fillFromObject(this._vars);
        };
        return URLManager;
    })();
    xm.URLManager = URLManager;
})(xm || (xm = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var git;
(function (git) {
    'use strict';

    var GithubURLs = (function (_super) {
        __extends(GithubURLs, _super);
        function GithubURLs(repo) {
            _super.call(this);
            this._base = 'https://github.com/{owner}/{project}';
            this._apiBase = 'https://api.github.com';
            this._api = 'https://api.github.com/repos/{owner}/{project}';
            this._raw = 'https://raw.github.com/{owner}/{project}';
            xm.assertVar(repo, git.GithubRepo, 'repo');
            this._repo = repo;

            this.addTemplate('base', this._base);

            this.addTemplate('raw', this._raw);
            this.addTemplate('rawFile', this._raw + '/{+ref}/{+path}');

            this.addTemplate('htmlFile', this._base + '/blob/{ref}/{+path}');

            this.addTemplate('api', this._api);
            this.addTemplate('apiTree', this._api + '/git/trees/{tree}?recursive={recursive}');
            this.addTemplate('apiBranch', this._api + '/branches/{branch}');
            this.addTemplate('apiBranches', this._api + '/branches');
            this.addTemplate('apiCommit', this._api + '/commits/{commit}');
            this.addTemplate('apiPathCommits', this._api + '/commits?path={path}');
            this.addTemplate('apiBlob', this._api + '/git/blobs/{blob}');
            this.addTemplate('rateLimit', this._apiBase + '/rate_limit');

            xm.object.hidePrefixed(this);
        }
        GithubURLs.prototype.getURL = function (id, vars) {
            this.setVars({
                owner: this._repo.config.repoOwner,
                project: this._repo.config.repoProject
            });
            return _super.prototype.getURL.call(this, id, vars);
        };

        GithubURLs.prototype.api = function () {
            return this.getURL('api');
        };

        GithubURLs.prototype.base = function () {
            return this.getURL('base');
        };

        GithubURLs.prototype.raw = function () {
            return this.getURL('raw');
        };

        GithubURLs.prototype.rawFile = function (ref, path) {
            xm.assertVar(ref, 'string', 'ref');
            xm.assertVar(path, 'string', 'path');

            return this.getURL('rawFile', {
                ref: ref,
                path: path
            });
        };

        GithubURLs.prototype.htmlFile = function (ref, path) {
            xm.assertVar(ref, 'string', 'ref');
            xm.assertVar(path, 'string', 'path');

            return this.getURL('htmlFile', {
                ref: ref,
                path: path
            });
        };

        GithubURLs.prototype.apiBranches = function () {
            return this.getURL('apiBranches');
        };

        GithubURLs.prototype.apiBranch = function (name) {
            xm.assertVar(name, 'string', 'name');
            return this.getURL('apiBranch', {
                branch: name
            });
        };

        GithubURLs.prototype.apiTree = function (tree, recursive) {
            xm.assertVar(tree, 'sha1', 'tree');
            return this.getURL('apiTree', {
                tree: tree,
                recursive: (recursive ? 1 : 0)
            });
        };

        GithubURLs.prototype.apiPathCommits = function (path) {
            xm.assertVar(path, 'string', 'path');
            return this.getURL('apiPathCommits', {
                path: path
            });
        };

        GithubURLs.prototype.apiCommit = function (commit, recursive) {
            xm.assertVar(commit, 'sha1', 'commit');
            return this.getURL('apiCommit', {
                commit: commit,
                recursive: recursive
            });
        };

        GithubURLs.prototype.apiBlob = function (sha) {
            xm.assertVar(sha, 'sha1', 'sha');
            return this.getURL('apiBlob', {
                blob: sha
            });
        };

        GithubURLs.prototype.rateLimit = function () {
            return this.getURL('rateLimit');
        };
        return GithubURLs;
    })(xm.URLManager);
    git.GithubURLs = GithubURLs;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';
})(git || (git = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');

    var ActionMap = (function () {
        function ActionMap(data) {
            var _this = this;
            this._map = new Map();
            if (data) {
                Object.keys(data).forEach(function (key, value) {
                    _this._map.set(key, value);
                });
            }
        }
        ActionMap.prototype.run = function (id, call, optional) {
            if (typeof optional === "undefined") { optional = false; }
            if (this._map.has(id)) {
                return Q(call(this._map.get(id)));
            } else if (!optional) {
                return Q.reject(new Error('missing action: ' + id));
            }
            return Q();
        };

        ActionMap.prototype.runSerial = function (ids, call, optional) {
            var _this = this;
            if (typeof optional === "undefined") { optional = false; }
            var queue = ids.slice(0);

            var defer = Q.defer();

            var runOne = function (value) {
                if (queue.length > 0) {
                    return _this.run(queue.pop(), call, optional).progress(defer.notify).then(runOne);
                }
                defer.resolve(value);
            };
            Q(runOne()).progress(defer.notify).fail(defer.reject);

            return defer.promise;
        };

        ActionMap.prototype.has = function (key) {
            return this._map.has(key);
        };

        ActionMap.prototype.get = function (key) {
            return this._map.get(key);
        };

        ActionMap.prototype.set = function (key, value) {
            return this._map.set(key, value);
        };
        return ActionMap;
    })();
    xm.ActionMap = ActionMap;

    var PromiseHandle = (function () {
        function PromiseHandle(defer, promise) {
            this.defer = defer;
            this.promise = (defer ? defer.promise : promise);
        }
        return PromiseHandle;
    })();
    xm.PromiseHandle = PromiseHandle;

    var PromiseStash = (function () {
        function PromiseStash() {
            this._stash = new Map();
        }
        PromiseStash.prototype.has = function (key) {
            return this._stash.has(key);
        };

        PromiseStash.prototype.promise = function (key) {
            if (this._stash.has(key)) {
                return this._stash.get(key).promise;
            }
            return null;
        };

        PromiseStash.prototype.defer = function (key) {
            if (this._stash.has(key)) {
                return null;
            }
            var d = Q.defer();
            this._stash.set(key, d);
            return d;
        };

        PromiseStash.prototype.remove = function (key) {
            this._stash.delete(key);
        };
        return PromiseStash;
    })();
    xm.PromiseStash = PromiseStash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var StatCounter = (function () {
        function StatCounter(log) {
            this.stats = Object.create(null);
            this.log = xm.log;
            this.log = log;
        }
        StatCounter.prototype.count = function (id, label) {
            var value = (id in this.stats ? this.stats[id] + 1 : 1);
            this.stats[id] = value;

            if (this.log) {
                this.log.debug(id + ': ' + value + (label ? ': ' + label : ''));
            }
            return value;
        };

        StatCounter.prototype.get = function (id) {
            if (id in this.stats) {
                return this.stats[id];
            }
            return 0;
        };

        StatCounter.prototype.has = function (id) {
            return (id in this.stats);
        };

        StatCounter.prototype.zero = function () {
            var _this = this;
            Object.keys(this.stats).forEach(function (id) {
                _this.stats[id] = 0;
            });
        };

        StatCounter.prototype.total = function () {
            var _this = this;
            return Object.keys(this.stats).reduce(function (memo, id) {
                return memo + _this.stats[id];
            }, 0);
        };

        StatCounter.prototype.counterNames = function () {
            return Object.keys(this.stats);
        };

        StatCounter.prototype.hasAllZero = function () {
            var _this = this;
            return !Object.keys(this.stats).some(function (id) {
                return _this.stats[id] !== 0;
            });
        };

        StatCounter.prototype.clear = function () {
            this.stats = Object.create(null);
        };

        StatCounter.prototype.getReport = function (label) {
            var _this = this;
            return (label ? label + ':\n' : '') + Object.keys(this.stats).sort().reduce(function (memo, id) {
                memo.push(id + ': ' + _this.stats[id]);
                return memo;
            }, []).join('\n');
        };

        StatCounter.prototype.getObject = function () {
            var _this = this;
            return Object.keys(this.stats).sort().reduce(function (memo, id) {
                memo[id] = _this.stats[id];
                return memo;
            }, Object.create(null));
        };
        return StatCounter;
    })();
    xm.StatCounter = StatCounter;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function padL(input, len, char) {
        char = String(char).charAt(0);
        input = String(input);
        while (input.length < len) {
            input = char + input;
        }
        return input;
    }

    function valueMap(data) {
        return Object.keys(data).reduce(function (memo, key) {
            if (xm.isValueType(data[key])) {
                memo[key] = data[key];
            }
            return memo;
        }, Object.create(null));
    }
    xm.valueMap = valueMap;

    xm.EventLevel = {
        start: 'start',
        complete: 'complete',
        failure: 'failure',
        skip: 'skip',
        share: 'share',
        event: 'event',
        error: 'error',
        warning: 'warning',
        success: 'success',
        status: 'status',
        promise: 'promise',
        resolve: 'resolve',
        reject: 'reject',
        notify: 'notify',
        debug: 'debug',
        log: 'log'
    };
    xm.EventLevel = xm.valueMap(xm.EventLevel);

    Object.freeze(xm.EventLevel);

    xm.startTime = Date.now();
    Object.defineProperty(xm, 'startTime', { writable: false });

    var EventLog = (function () {
        function EventLog(prefix, label, logger) {
            if (typeof prefix === "undefined") { prefix = ''; }
            if (typeof label === "undefined") { label = ''; }
            this._items = [];
            this.logEnabled = false;
            this._trackEnabled = false;
            this._trackLimit = 100;
            this._trackPrune = 30;
            this._mutePromises = [xm.EventLevel.notify, xm.EventLevel.promise, xm.EventLevel.resolve, xm.EventLevel.reject];
            this._label = label;
            this._prefix = (prefix ? prefix + ':' : '');

            this.logger = logger || (label ? xm.getLogger(this._label) : (xm.log || xm.getLogger()));

            this._startAt = Date.now();

            xm.object.hidePrefixed(this);
        }
        EventLog.prototype.promise = function (promise, type, message, data) {
            var _this = this;
            if (!this.isMuted(xm.EventLevel.notify)) {
                promise.progress(function (note) {
                    _this.track(xm.EventLevel.notify, type, message, note);
                });
            }
            if (!this.isMuted(xm.EventLevel.reject)) {
                promise.fail(function (err) {
                    _this.track(xm.EventLevel.reject, type, message, err);
                });
            }
            if (!this.isMuted(xm.EventLevel.resolve)) {
                promise.then(function () {
                    _this.track(xm.EventLevel.resolve, type, message);
                });
            }
            if (!this.isMuted(xm.EventLevel.promise)) {
                return this.track(xm.EventLevel.promise, type, message);
            }
            return null;
        };

        EventLog.prototype.start = function (type, message, data) {
            return this.track(xm.EventLevel.start, type, message, data);
        };

        EventLog.prototype.complete = function (type, message, data) {
            return this.track(xm.EventLevel.complete, type, message, data);
        };

        EventLog.prototype.failure = function (type, message, data) {
            return this.track(xm.EventLevel.complete, type, message, data);
        };

        EventLog.prototype.event = function (type, message, data) {
            return this.track(xm.EventLevel.event, type, message, data);
        };

        EventLog.prototype.skip = function (type, message, data) {
            return this.track(xm.EventLevel.skip, type, message, data);
        };

        EventLog.prototype.share = function (type, message, data) {
            return this.track(xm.EventLevel.share, type, message, data);
        };

        EventLog.prototype.error = function (type, message, data) {
            return this.track(xm.EventLevel.error, type, message, data);
        };

        EventLog.prototype.warning = function (type, message, data) {
            return this.track(xm.EventLevel.warning, type, message, data);
        };

        EventLog.prototype.success = function (type, message, data) {
            return this.track(xm.EventLevel.success, type, message, data);
        };

        EventLog.prototype.status = function (type, message, data) {
            return this.track(xm.EventLevel.status, type, message, data);
        };

        EventLog.prototype.log = function (type, message, data) {
            return this.track(xm.EventLevel.log, type, message, data);
        };

        EventLog.prototype.debug = function (type, message, data) {
            return this.track(xm.EventLevel.debug, type, message, data);
        };

        EventLog.prototype.track = function (action, type, message, data, group) {
            var item = new EventLogItem();
            item.type = this._prefix + type;
            item.action = action;
            item.message = message;
            item.data = data;
            item.time = (Date.now() - xm.startTime);
            item.group = group;

            Object.freeze(item);

            if (this._trackEnabled) {
                this._items.push(item);
                this.trim();
            }
            if (this.logEnabled) {
                this.logger.status(this.getItemString(item, true));
            }
            return item;
        };

        EventLog.prototype.trim = function (all) {
            if (typeof all === "undefined") { all = false; }
            if (all) {
                this._items.splice(0, this._items.length);
            } else if (this._trackLimit > 0 && this._items.length > this._trackLimit + this._trackPrune) {
                this._items.splice(this._trackLimit, this._items.length - this._trackPrune);
            }
        };

        EventLog.prototype.reset = function () {
            this._startAt = Date.now();
            this._items.splice(0, this._items.length);
        };

        EventLog.prototype.isMuted = function (action) {
            return this._mutePromises.indexOf(action) > -1;
        };

        EventLog.prototype.muteActions = function (actions) {
            var _this = this;
            actions.forEach(function (action) {
                if (_this._mutePromises.indexOf(action) < 0) {
                    _this._mutePromises.push(action);
                }
            });
        };

        EventLog.prototype.unmuteActions = function (actions) {
            var _this = this;
            if (!actions) {
                this._mutePromises = [];
                return;
            }
            actions.forEach(function (action) {
                for (var i = _this._mutePromises.length - 1; i > -1; i--) {
                    if (actions.indexOf(action) > -1) {
                        _this._mutePromises.splice(i, 1);
                    }
                }
            });
        };

        EventLog.prototype.unmuteAll = function () {
            this._mutePromises = [];
        };

        EventLog.prototype.setTrack = function (enabled, limit, prune) {
            if (typeof limit === "undefined") { limit = NaN; }
            if (typeof prune === "undefined") { prune = NaN; }
            this._trackEnabled = enabled;
            this._trackLimit = (isNaN(limit) ? this._trackLimit : limit);
            this._trackPrune = (isNaN(prune) ? this._trackPrune : prune);
        };

        EventLog.prototype.getItemString = function (item, multiline) {
            if (typeof multiline === "undefined") { multiline = false; }
            var msg = '';

            msg += item.action + ' -> ' + item.type;

            if (xm.isValid(item.message) && item.message.length > 0) {
                msg += (multiline ? '\n      ' : ': ') + xm.trimWrap(item.message, 200, true);
            }
            if (xm.isValid(item.data)) {
                msg += (multiline ? '\n      ' : ': ') + xm.toValueStrim(item.data, 4, 200);
            }
            return msg;
        };

        EventLog.prototype.getHistory = function () {
            var _this = this;
            var memo = [];
            if (this._label) {
                memo.push(this._label + '(' + this._items.length + ')');
            }
            return this._items.reduce(function (memo, item) {
                memo.push(_this.getItemString(item));
                return memo;
            }, memo).join('\n');
        };

        EventLog.prototype.getStats = function () {
            var ret = new xm.StatCounter();
            this._items.forEach(function (item) {
                ret.count(item.action);
            });
            return ret;
        };

        EventLog.prototype.getItems = function () {
            return (this._trackLimit > 0 ? this._items.slice(0, this._trackLimit) : this._items.slice(0));
        };

        EventLog.prototype.getReport = function (label) {
            return this.getStats().getReport(label);
        };
        return EventLog;
    })();
    xm.EventLog = EventLog;

    var itemCounter = 0;

    var EventLogItem = (function () {
        function EventLogItem() {
            this.index = (++itemCounter);
        }
        EventLogItem.prototype.toString = function () {
            return this.action + ':' + this.type + ' #' + this.index;
        };
        return EventLogItem;
    })();
    xm.EventLogItem = EventLogItem;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var crypto = require('crypto');

    function md5(data) {
        return crypto.createHash('md5').update(data).digest('hex');
    }
    xm.md5 = md5;

    function sha1(data) {
        return crypto.createHash('sha1').update(data).digest('hex');
    }
    xm.sha1 = sha1;

    function sha1Short(data, length) {
        if (typeof length === "undefined") { length = 8; }
        return crypto.createHash('sha1').update(data).digest('hex').substring(0, length);
    }
    xm.sha1Short = sha1Short;

    var hashNormExp = /[\r\n]+/g;
    var hashNew = '\n';

    function hashNormalines(input) {
        return sha1(input.replace(hashNormExp, hashNew));
    }
    xm.hashNormalines = hashNormalines;

    function jsonToIdent(obj) {
        var ret = '';
        var sep = ';';
        var type = xm.typeOf(obj);
        if (type === 'string' || type === 'number' || type === 'boolean') {
            ret += JSON.stringify(obj) + sep;
        } else if (type === 'regexp' || type === 'function') {
            throw (new Error('jsonToIdent: cannot serialise: ' + type));
        } else if (type === 'date') {
            ret += '<Date>' + obj.getTime() + sep;
        } else if (type === 'array') {
            ret += '[';
            obj.forEach(function (value) {
                ret += jsonToIdent(value);
            });
            ret += ']' + sep;
        } else if (type === 'object') {
            var keys = Object.keys(obj);
            keys.sort();
            ret += '{';
            keys.forEach(function (key) {
                ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
            });
            ret += '}' + sep;
        } else if (type === 'null') {
            ret += 'null';
        } else {
            throw (new Error('jsonToIdent: cannot serialise value: ' + xm.toValueStrim(obj)));
        }
        return ret;
    }
    xm.jsonToIdent = jsonToIdent;

    function jsonToIdentHash(obj, length) {
        if (typeof length === "undefined") { length = 0; }
        var ident = sha1(jsonToIdent(obj));
        if (length > 0) {
            ident = ident.substr(0, length);
        }
        return ident;
    }
    xm.jsonToIdentHash = jsonToIdentHash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var tv4 = require('tv4');
    var reporter = require('tv4-reporter');

    

    var StringKoder = (function () {
        function StringKoder(encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            this.encoding = encoding;
        }
        StringKoder.prototype.decode = function (content) {
            var _this = this;
            return Q().then(function () {
                if (!xm.isValid(content)) {
                    throw new Error('undefined content');
                }
                return content.toString(_this.encoding);
            });
        };

        StringKoder.prototype.encode = function (value) {
            var _this = this;
            return Q().then(function () {
                if (!xm.isValid(value)) {
                    throw new Error('undefined content');
                }
                return new Buffer(value, _this.encoding);
            });
        };

        StringKoder.utf8 = new StringKoder('utf8');
        return StringKoder;
    })();
    xm.StringKoder = StringKoder;

    var ByteKoder = (function () {
        function ByteKoder() {
        }
        ByteKoder.prototype.decode = function (content) {
            return Q().then(function () {
                if (!xm.isValid(content)) {
                    throw new Error('undefined content');
                }
                return content;
            });
        };

        ByteKoder.prototype.encode = function (value) {
            return Q().then(function () {
                if (!xm.isValid(value)) {
                    throw new Error('undefined content');
                }
                return value;
            });
        };

        ByteKoder.main = new ByteKoder();
        return ByteKoder;
    })();
    xm.ByteKoder = ByteKoder;

    var JSONKoder = (function () {
        function JSONKoder(schema) {
            this.schema = schema;
        }
        JSONKoder.prototype.decode = function (content) {
            var _this = this;
            return Q().then(function () {
                if (!xm.isValid(content)) {
                    throw new Error('undefined content');
                }
                return JSON.parse(content.toString('utf8'));
            }).then(function (value) {
                _this.assert(value);
                return value;
            });
        };

        JSONKoder.prototype.assert = function (value) {
            xm.assert(xm.isJSONValue(value), 'is not a JSON value {a}', value);
            if (this.schema) {
                var res = tv4.validateResult(value, this.schema);
                if (!res.valid || res.missing.length > 0) {
                    var report = reporter.getReporter(xm.log.out.getWrite(), xm.log.out.getStyle());
                    var test = report.createTest(this.schema, value, null, res, true);
                    if (res.missing.length > 0) {
                        report.reportMissing(test, '   ');
                        throw new Error('missing schemas');
                    } else {
                        report.reportError(test, res.error, '   ', '   ');
                        throw res.error;
                    }
                }
            }
        };

        JSONKoder.prototype.encode = function (value) {
            var _this = this;
            return Q().then(function () {
                if (!xm.isValid(value)) {
                    throw new Error('undefined content');
                }
                _this.assert(value);
                return new Buffer(JSON.stringify(value, null, 2), 'utf8');
            });
        };

        JSONKoder.main = new JSONKoder();
        return JSONKoder;
    })();
    xm.JSONKoder = JSONKoder;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function getNote(message, code, data) {
        return {
            code: (xm.isValid(code) ? String(code) : null),
            message: message,
            data: data
        };
    }
    xm.getNote = getNote;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    (function (http) {
        (function (CacheMode) {
            CacheMode[CacheMode["forceLocal"] = 1] = "forceLocal";
            CacheMode[CacheMode["forceRemote"] = 2] = "forceRemote";
            CacheMode[CacheMode["forceUpdate"] = 3] = "forceUpdate";
            CacheMode[CacheMode["allowRemote"] = 4] = "allowRemote";
            CacheMode[CacheMode["allowUpdate"] = 5] = "allowUpdate";
        })(http.CacheMode || (http.CacheMode = {}));
        var CacheMode = http.CacheMode;

        var CacheOpts = (function () {
            function CacheOpts(mode) {
                this.compressStore = false;
                this.splitDirLevel = 0;
                this.splitDirChunk = 1;
                this.cacheRead = true;
                this.cacheWrite = true;
                this.remoteRead = true;
                this.allowClean = false;
                this.jobTimeout = 0;
                if (mode) {
                    this.applyCacheMode(mode);
                }
            }
            CacheOpts.prototype.applyCacheMode = function (mode) {
                switch (mode) {
                    case 2 /* forceRemote */:
                        this.cacheRead = false;
                        this.remoteRead = true;
                        this.cacheWrite = false;
                        this.allowClean = false;
                        break;
                    case 3 /* forceUpdate */:
                        this.cacheRead = false;
                        this.remoteRead = true;
                        this.cacheWrite = true;
                        this.allowClean = true;
                        break;
                    case 5 /* allowUpdate */:
                        this.cacheRead = true;
                        this.remoteRead = true;
                        this.cacheWrite = true;
                        this.allowClean = true;
                        break;
                    case 4 /* allowRemote */:
                        this.cacheRead = true;
                        this.remoteRead = true;
                        this.cacheWrite = false;
                        this.allowClean = false;
                        break;
                    case 1 /* forceLocal */:
                    default:
                        this.cacheRead = true;
                        this.remoteRead = false;
                        this.cacheWrite = false;
                        this.allowClean = false;
                        break;
                }
            };
            return CacheOpts;
        })();
        http.CacheOpts = CacheOpts;
    })(xm.http || (xm.http = {}));
    var http = xm.http;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var tv4 = require('tv4');
    var FS = require('q-io/fs');

    var es = require('event-stream');
    var zlib = require('zlib');
    var request = require('request');
    var BufferStream = require('bufferstream');

    (function (http) {
        var CacheStreamLoader = (function () {
            function CacheStreamLoader(cache, request) {
                this.cache = cache;
                this.request = request;

                this.bodyCacheValidator = new xm.http.ChecksumValidator();

                if (this.cache.opts.remoteRead) {
                    this.infoCacheValidator = new xm.http.CacheAgeValidator(this.cache.infoSchema, request.localMaxAge);
                } else {
                    this.infoCacheValidator = new xm.http.CacheValidator(this.cache.infoSchema);
                }
                this.track = new xm.EventLog('http_load', 'CacheStreamLoader');

                this.object = new xm.http.CacheObject(this.request);
                this.object.storeDir = xm.file.distributeDir(this.cache.storeDir, this.request.key, this.cache.opts.splitDirLevel, this.cache.opts.splitDirChunk);

                this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
                this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');

                xm.object.lockProps(this, ['cache', 'request', 'object']);
            }
            CacheStreamLoader.prototype.destruct = function () {
                this._defer = null;
            };

            CacheStreamLoader.prototype.canUpdate = function () {
                if (this.cache.opts.cacheRead && this.cache.opts.remoteRead && this.cache.opts.cacheWrite) {
                    return true;
                }
                return false;
            };

            CacheStreamLoader.prototype.getObject = function () {
                var _this = this;
                if (this._defer) {
                    this.track.skip(CacheStreamLoader.get_object);
                    return this._defer.promise;
                }

                this._defer = Q.defer();
                this.track.promise(this._defer.promise, CacheStreamLoader.get_object);

                this.cacheRead().progress(this._defer.notify).then(function () {
                    var useCached = false;
                    if (_this.object.body && _this.object.info) {
                        useCached = !_this.request.forceRefresh;
                        if (useCached && xm.isNumber(_this.request.httpInterval) && _this.cache.opts.cacheWrite) {
                            if (new Date(_this.object.info.cacheUpdated).getTime() < Date.now() - _this.request.httpInterval) {
                                _this._defer.notify(xm.getNote('update: ' + _this.request.url + ' -> ' + _this.request.key));
                                useCached = false;
                            }
                        }
                    }

                    if (useCached) {
                        return _this.cacheTouch().then(function () {
                            _this._defer.notify(xm.getNote('local: ' + _this.request.url + ' -> ' + _this.request.key));
                            _this._defer.resolve(_this.object);
                        });
                    }

                    return _this.httpLoad(!_this.request.forceRefresh).progress(_this._defer.notify).then(function () {
                        if (!xm.isValid(_this.object.body)) {
                            throw new Error('no result body: ' + _this.request.url + ' -> ' + _this.request.key);
                        }
                        _this._defer.resolve(_this.object);
                    });
                }).fail(function (err) {
                    _this._defer.reject(err);
                    _this._defer = null;
                }).done();

                return this._defer.promise;
            };

            CacheStreamLoader.prototype.cacheRead = function () {
                var _this = this;
                if (!this.cache.opts.cacheRead) {
                    this.track.skip(CacheStreamLoader.cache_read);
                    return Q().thenResolve();
                }
                var d = Q.defer();
                this.track.promise(d.promise, CacheStreamLoader.cache_read);

                this.readInfo().progress(d.notify).then(function () {
                    if (!_this.object.info) {
                        throw new Error('no or invalid info object');
                    }
                    try  {
                        _this.infoCacheValidator.assert(_this.object);
                    } catch (err) {
                        _this.track.event(CacheStreamLoader.local_info_bad, 'cache-info unsatisfactory', err);
                        d.notify(xm.getNote('cache info unsatisfactory: ' + err.message, xm.LogLevel.status, err));

                        throw err;
                    }

                    return FS.read(_this.object.bodyFile, { flags: 'rb' }).then(function (buffer) {
                        if (buffer.length === 0) {
                            throw new Error('empty body file');
                        }
                        _this.object.bodyChecksum = xm.sha1(buffer);
                        _this.object.body = buffer;
                    });
                }).then(function () {
                    try  {
                        _this.bodyCacheValidator.assert(_this.object);

                        _this.track.event(CacheStreamLoader.local_cache_hit);
                        d.resolve();
                        return;
                    } catch (err) {
                        _this.track.error(CacheStreamLoader.local_body_bad, 'cache-body invalid:' + err.message, err);
                        _this.track.logger.error('cache invalid');
                        _this.track.logger.inspect(err);
                        throw err;
                    }
                }).fail(function (err) {
                    _this.object.info = null;
                    _this.object.body = null;
                    _this.object.bodyChecksum = null;

                    return _this.cacheRemove().then(d.resolve, d.reject, d.notify);
                }).done();

                return d.promise;
            };

            CacheStreamLoader.prototype.httpLoad = function (httpCache) {
                var _this = this;
                if (typeof httpCache === "undefined") { httpCache = true; }
                if (!this.cache.opts.remoteRead) {
                    this.track.skip(CacheStreamLoader.http_load);
                    return Q().thenResolve();
                }
                var d = Q.defer();
                this.track.promise(d.promise, CacheStreamLoader.http_load);

                var req = {
                    url: this.request.url,
                    headers: {}
                };

                if (this.cache.proxy) {
                    req.proxy = this.cache.proxy;
                }

                Object.keys(this.request.headers).forEach(function (key) {
                    req.headers[key] = String(_this.request.headers[key]);
                });

                if (this.object.info && this.object.body && httpCache) {
                    if (this.object.info.httpETag) {
                        req.headers['if-none-match'] = this.object.info.httpETag;
                    }
                    if (this.object.info.httpModified) {
                        req.headers['if-modified-since'] = new Date(this.object.info.httpModified).toUTCString();
                    }
                }

                req.headers['accept-encoding'] = 'gzip, deflate';

                this.track.start(CacheStreamLoader.http_load);
                if (this.track.logEnabled) {
                    this.track.logger.inspect(this.request);
                    this.track.logger.inspect(req);
                }
                d.notify(xm.getNote('loading: ' + this.request.url));

                var writer = new BufferStream({ size: 'flexible' });

                var pause = es.pause();
                pause.pause();

                request.get(req).on('response', function (res) {
                    if (_this.track.logEnabled) {
                        _this.track.logger.status(String(res.statusCode) + ' ' + _this.request.url);
                        _this.track.logger.inspect(res.headers);
                    }

                    _this.object.response = new xm.http.ResponseInfo();
                    _this.object.response.status = res.statusCode;
                    _this.object.response.headers = res.headers;

                    if (res.statusCode < 200 || res.statusCode >= 400) {
                        _this.track.error(CacheStreamLoader.http_load);
                        d.reject(new Error('unexpected status code: ' + res.statusCode + ' on: ' + _this.request.url));
                        return;
                    }
                    if (res.statusCode === 304) {
                        if (!_this.object.body) {
                            d.reject(new Error('flow error: http 304 but no local content on: ' + _this.request.url));
                            return;
                        }
                        if (!_this.object.info) {
                            d.reject(new Error('flow error: http 304 but no local info on: ' + _this.request.url));
                            return;
                        }

                        _this.track.event(CacheStreamLoader.http_cache_hit);

                        _this._defer.notify(xm.getNote('remote: ' + _this.request.url + ' -> ' + _this.request.key, res.statusCode));

                        _this.updateInfo(res, _this.object.info.contentChecksum);

                        _this.cacheWrite(true).done(d.resolve, d.reject);
                        return;
                    }

                    switch (res.headers['content-encoding']) {
                        case 'gzip':
                            pause.pipe(zlib.createGunzip()).pipe(writer);
                            break;
                        case 'deflate':
                            pause.pipe(zlib.createInflate()).pipe(writer);
                            break;
                        default:
                            pause.pipe(writer);
                            break;
                    }

                    writer.on('end', function () {
                        var body = writer.getBuffer();
                        if (!body) {
                            throw new Error('flow error: http 304 but no local info on: ' + _this.request.url);
                        }
                        if (body.length === 0) {
                            throw new Error('loaded zero bytes ' + _this.request.url);
                        }
                        var checksum = xm.sha1(body);

                        if (_this.object.info) {
                            if (_this.object.info.contentChecksum) {
                            }
                            _this.updateInfo(res, checksum);
                        } else {
                            _this.copyInfo(res, checksum);
                        }
                        _this.object.body = body;

                        _this._defer.notify(xm.getNote('remote: ' + _this.request.url + ' -> ' + _this.request.key, 'http ' + res.statusCode));
                        _this.track.complete(CacheStreamLoader.http_load);

                        _this.cacheWrite(false).done(d.resolve, d.reject, d.notify);
                    });

                    pause.resume();
                }).pipe(pause).on('error', function (err) {
                    _this.track.complete(CacheStreamLoader.http_error, 'request error');
                    d.reject(err);
                });

                return d.promise;
            };

            CacheStreamLoader.prototype.cacheWrite = function (cacheWasFresh) {
                var _this = this;
                if (!this.cache.opts.cacheWrite) {
                    this.track.skip(CacheStreamLoader.cache_write);
                    return Q().thenResolve();
                }
                var d = Q.defer();
                this.track.promise(d.promise, CacheStreamLoader.cache_write);

                if (this.object.body.length === 0) {
                    d.reject(new Error('wont write empty file to ' + this.object.bodyFile));
                    return;
                }

                this.cache.infoKoder.encode(this.object.info).then(function (info) {
                    if (info.length === 0) {
                        d.reject(new Error('wont write empty info file ' + _this.object.infoFile));
                        return;
                    }

                    var write = [];
                    if (!cacheWasFresh) {
                        if (_this.object.body.length === 0) {
                            d.reject(new Error('wont write empty body file ' + _this.object.bodyFile));
                            return;
                        }

                        write.push(xm.file.mkdirCheckQ(path.dirname(_this.object.bodyFile), true).then(function () {
                            return FS.write(_this.object.bodyFile, _this.object.body, { flags: 'wb' });
                        }).then(function () {
                            _this.track.event(CacheStreamLoader.cache_write, 'written file to cache');
                        }));
                    } else {
                        _this.track.skip(CacheStreamLoader.cache_write, 'cache was fresh');
                    }

                    write.push(xm.file.mkdirCheckQ(path.dirname(_this.object.infoFile), true).then(function () {
                        return FS.write(_this.object.infoFile, info, { flags: 'wb' });
                    }));

                    return Q.all(write).fail(function (err) {
                        _this.track.error(CacheStreamLoader.cache_write, 'file write', err);
                        throw err;
                    }).then(function () {
                        return Q.all([
                            _this.checkExists(_this.object.bodyFile, 'body').progress(d.notify),
                            _this.checkExists(_this.object.infoFile, 'info').progress(d.notify)
                        ]);
                    }).then(function () {
                        return _this.cacheTouch();
                    });
                }).done(d.resolve, d.reject);

                return d.promise;
            };

            CacheStreamLoader.prototype.checkExists = function (file, label) {
                var d = Q.defer();
                FS.exists(file).then(function (exist) {
                    if (exist) {
                        return FS.stat(file).then(function (stat) {
                            if (stat.size === 0) {
                                d.notify(xm.getNote('written zero ' + label + ' bytes to: ' + file, xm.LogLevel.error));
                                d.resolve(false);
                            } else {
                                d.resolve(true);
                            }
                        });
                    } else {
                        d.notify(xm.getNote('missing ' + label + ' file: ' + file, xm.LogLevel.error));
                        d.resolve(false);
                    }
                }).fail(d.reject);
                return d.promise;
            };

            CacheStreamLoader.prototype.cacheRemove = function () {
                var _this = this;
                if (!this.canUpdate()) {
                    return Q.resolve();
                }
                return Q.all([
                    xm.file.removeFile(this.object.infoFile),
                    xm.file.removeFile(this.object.bodyFile)
                ]).then(function () {
                    _this.track.event(CacheStreamLoader.cache_remove, _this.request.url);
                });
            };

            CacheStreamLoader.prototype.cacheTouch = function () {
                var d = Q.defer();
                if (!this.canUpdate()) {
                    return Q.resolve();
                }
                Q.all([
                    xm.file.touchFile(this.object.infoFile),
                    xm.file.touchFile(this.object.bodyFile)
                ]).done(function () {
                    d.resolve();
                }, d.reject);
                return d.promise;
            };

            CacheStreamLoader.prototype.copyInfo = function (res, checksum) {
                xm.assertVar(checksum, 'sha1', 'checksum');
                var info = {};
                this.object.info = info;
                info.url = this.request.url;
                info.key = this.request.key;
                info.contentType = res.headers['content-type'];

                info.cacheCreated = xm.date.getISOString(Date.now());
                info.cacheUpdated = xm.date.getISOString(Date.now());
                this.updateInfo(res, checksum);
            };

            CacheStreamLoader.prototype.updateInfo = function (res, checksum) {
                var info = this.object.info;
                info.httpETag = (res.headers['etag'] || info.httpETag);

                info.httpModified = xm.date.getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
                info.cacheUpdated = xm.date.getISOString(Date.now());
                info.contentChecksum = checksum;
            };

            CacheStreamLoader.prototype.readInfo = function () {
                var _this = this;
                var d = Q.defer();
                this.track.promise(d.promise, CacheStreamLoader.info_read);

                FS.isFile(this.object.infoFile).then(function (isFile) {
                    if (!isFile) {
                        return null;
                    }
                    return FS.read(_this.object.infoFile, { flags: 'rb' }).then(function (buffer) {
                        if (buffer.length === 0) {
                            _this.track.event(CacheStreamLoader.local_info_empty, 'empty info file');
                            return null;
                        }
                        return _this.cache.infoKoder.decode(buffer).then(function (info) {
                            xm.assert((info.url === _this.request.url), 'info.url {a} is not {e}', info.url, _this.request.url);
                            xm.assert((info.key === _this.request.key), 'info.key {a} is not {e}', info.key, _this.request.key);

                            _this.object.info = info;
                        }).fail(function (err) {
                            _this.track.event(CacheStreamLoader.local_info_malformed, 'mlaformed info file');
                            throw err;
                        });
                    });
                }).then(function () {
                    d.resolve();
                }, d.reject).done();
                return d.promise;
            };

            CacheStreamLoader.prototype.toString = function () {
                return this.request ? this.request.url : '<no request>';
            };
            CacheStreamLoader.get_object = 'get_object';
            CacheStreamLoader.info_read = 'info_read';
            CacheStreamLoader.cache_read = 'cache_read';
            CacheStreamLoader.cache_write = 'cache_write';
            CacheStreamLoader.cache_remove = 'cache_remove';
            CacheStreamLoader.http_load = 'http_load';
            CacheStreamLoader.http_error = 'http_error';
            CacheStreamLoader.local_info_bad = 'local_info_bad';
            CacheStreamLoader.local_info_empty = 'local_info_empty';
            CacheStreamLoader.local_info_malformed = 'local_info_malformed';
            CacheStreamLoader.local_body_bad = 'local_body_bad';
            CacheStreamLoader.local_body_empty = 'local_body_empty';
            CacheStreamLoader.local_cache_hit = 'local_cache_hit';
            CacheStreamLoader.http_cache_hit = 'http_cache_hit';
            return CacheStreamLoader;
        })();
        http.CacheStreamLoader = CacheStreamLoader;
    })(xm.http || (xm.http = {}));
    var http = xm.http;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var tv4 = require('tv4');

    function assertJSONSchema(value, schema) {
        var res = tv4.validateResult(value, schema);
        if (!res.valid) {
            throw res.error;
        }
        if (res.missing && res.missing.length > 0) {
            throw new Error('validation error, missing schema: ' + res.missing);
        }
    }
    xm.assertJSONSchema = assertJSONSchema;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    (function (http) {
        var CacheRequest = (function () {
            function CacheRequest(url, headers) {
                this.url = url;
                this.headers = headers || {};
            }
            CacheRequest.prototype.lock = function () {
                var _this = this;
                this.locked = true;

                var keyHash = {
                    url: this.url,
                    headers: Object.keys(this.headers).reduce(function (memo, key) {
                        if (CacheRequest.keyHeaders.indexOf(key) > -1) {
                            memo[key] = _this.headers[key];
                        }
                        return memo;
                    }, Object.create(null))
                };
                this.key = xm.jsonToIdentHash(keyHash);
                xm.object.lockProps(this, CacheRequest.lockProps);

                xm.object.deepFreeze(this.headers);
                return this;
            };
            CacheRequest.lockProps = [
                'key',
                'url',
                'headers',
                'localMaxAge',
                'httpInterval',
                'forceRefresh',
                'locked'
            ];
            CacheRequest.keyHeaders = [
                'accept',
                'accept-charset',
                'accept-language',
                'content-md5',
                'content-type',
                'cookie',
                'host'
            ];
            return CacheRequest;
        })();
        http.CacheRequest = CacheRequest;

        var CacheObject = (function () {
            function CacheObject(request) {
                this.request = request;
            }
            return CacheObject;
        })();
        http.CacheObject = CacheObject;

        var ResponseInfo = (function () {
            function ResponseInfo() {
                this.status = 0;
                this.headers = {};
            }
            return ResponseInfo;
        })();
        http.ResponseInfo = ResponseInfo;

        

        

        var SimpleValidator = (function () {
            function SimpleValidator() {
            }
            SimpleValidator.prototype.assert = function (object) {
                xm.assert(xm.isValid(object.body), 'body valid');
            };

            SimpleValidator.main = new SimpleValidator();
            return SimpleValidator;
        })();
        http.SimpleValidator = SimpleValidator;

        var CacheValidator = (function () {
            function CacheValidator(schema) {
                this.schema = schema;
            }
            CacheValidator.prototype.assert = function (object) {
                xm.assertJSONSchema(object.info, this.schema);
            };
            return CacheValidator;
        })();
        http.CacheValidator = CacheValidator;

        var CacheAgeValidator = (function () {
            function CacheAgeValidator(schema, maxAgeMili) {
                this.schema = schema;
                this.maxAgeMili = 0;
                this.maxAgeMili = maxAgeMili;
            }
            CacheAgeValidator.prototype.assert = function (object) {
                xm.assertJSONSchema(object.info, this.schema);

                var date = new Date(object.info.cacheUpdated);
                if (xm.isNumber(this.maxAgeMili)) {
                    var compare = new Date();
                    xm.assert(date.getTime() < compare.getTime() + this.maxAgeMili, 'checksum {a} vs {e}', date.toISOString(), compare.toISOString());
                }
            };
            return CacheAgeValidator;
        })();
        http.CacheAgeValidator = CacheAgeValidator;

        var ChecksumValidator = (function () {
            function ChecksumValidator() {
            }
            ChecksumValidator.prototype.assert = function (object) {
                xm.assertVar(object.body, Buffer, 'body');
                xm.assertVar(object.bodyChecksum, 'sha1', 'bodyChecksum');
                xm.assertVar(object.info.contentChecksum, 'sha1', 'contentChecksum');
                xm.assert(object.info.contentChecksum === object.bodyChecksum, 'checksum', object.info.contentChecksum, object.bodyChecksum);
            };
            return ChecksumValidator;
        })();
        http.ChecksumValidator = ChecksumValidator;
    })(xm.http || (xm.http = {}));
    var http = xm.http;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var HTTP = require('q-io/http');

    (function (http) {
        var HTTPCache = (function () {
            function HTTPCache(storeDir, opts) {
                this.jobs = new Map();
                this.jobTimers = new Map();
                xm.assertVar(storeDir, 'string', 'storeDir');
                xm.assertVar(opts, xm.http.CacheOpts, 'opts');

                this.storeDir = storeDir;
                this.opts = opts;

                this.track = new xm.EventLog('http_cache', 'HTTPCache');
                this.track.unmuteActions([xm.EventLevel.reject, xm.EventLevel.notify]);

                this.setStoreDir(storeDir);
            }
            HTTPCache.prototype.setStoreDir = function (dir) {
                this.manageFile = path.join(this.storeDir, '_info.json');
            };

            HTTPCache.prototype.getObject = function (request) {
                var _this = this;
                xm.assertVar(request, xm.http.CacheRequest, 'request');
                xm.assert(request.locked, 'request must be lock()-ed {a}', request.url);

                var d = Q.defer();
                this.track.promise(d.promise, HTTPCache.get_object);

                this.init().then(function () {
                    var job;
                    if (_this.jobs.has(request.key)) {
                        job = _this.jobs.get(request.key);
                        _this.track.share(HTTPCache.get_object, request.url);

                        return job.getObject().progress(d.notify).then(d.resolve);
                    } else {
                        job = new xm.http.CacheStreamLoader(_this, request);
                        _this.jobs.set(request.key, job);

                        job.track.logEnabled = _this.track.logEnabled;
                        _this.track.start(HTTPCache.get_object, request.url);

                        return job.getObject().progress(d.notify).then(function (value) {
                            _this.track.complete(HTTPCache.get_object);
                            d.resolve(value);
                        });
                    }
                }).fail(d.reject).then(function () {
                    _this.scheduleRelease(request.key);

                    return _this.checkCleanCache();
                }).done();

                return d.promise;
            };

            HTTPCache.prototype.scheduleRelease = function (key) {
                var _this = this;
                if (this.jobs.has(key)) {
                    if (this.jobTimers.has(key)) {
                        clearTimeout(this.jobTimers.get(key));
                    }

                    if (this.opts.jobTimeout <= 0) {
                        this.track.event(HTTPCache.drop_job, 'droppped ' + key, this.jobs.get(key));
                        this.jobs.get(key).destruct();
                        this.jobs.delete(key);
                    } else {
                        var timer = setTimeout(function () {
                            _this.track.event(HTTPCache.drop_job, 'droppped ' + key, _this.jobs.get(key));

                            _this.jobs.get(key).destruct();
                            _this.jobs.delete(key);
                        }, this.opts.jobTimeout);

                        timer.unref();

                        this.jobTimers.set(key, timer);
                    }
                }
            };

            HTTPCache.prototype.init = function () {
                var _this = this;
                if (this._init) {
                    this.track.skip('init');
                    return this._init;
                }
                var d = Q.defer();
                this._init = d.promise;
                this.track.promise(d.promise, 'init');

                var baseDir;
                var schemaDir;

                FS.exists(this.storeDir).then(function (exists) {
                    if (!exists) {
                        _this.track.event(HTTPCache.dir_create, _this.storeDir);
                        return xm.file.mkdirCheckQ(_this.storeDir, true, true);
                    }
                }).then(function () {
                    return FS.isDirectory(_this.storeDir).then(function (isDir) {
                        if (!isDir) {
                            _this.track.error(HTTPCache.dir_error, _this.storeDir);
                            throw new Error('is not a directory: ' + _this.storeDir);
                        }
                        _this.track.event(HTTPCache.dir_exists, _this.storeDir);
                    });
                }).then(function () {
                    return xm.file.findup(path.dirname((module).filename), 'package.json').then(function (src) {
                        baseDir = path.dirname(src);
                        schemaDir = path.join(baseDir, 'schema');
                    });
                }).then(function () {
                    var p = path.join(schemaDir, 'cache-v1.json');
                    return xm.file.readJSONPromise(p).then(function (infoSchema) {
                        xm.assertVar(infoSchema, 'object', 'infoSchema');
                        _this.infoSchema = infoSchema;
                        _this.infoKoder = new xm.JSONKoder(_this.infoSchema);
                    });
                }).then(function () {
                    var p = path.join(schemaDir, 'manage-v1.json');
                    return xm.file.readJSONPromise(p).then(function (manageSchema) {
                        xm.assertVar(manageSchema, 'object', 'manageSchema');
                        _this.manageSchema = manageSchema;
                        _this.manageKoder = new xm.JSONKoder(_this.manageSchema);
                    });
                }).done(function () {
                    d.resolve();
                }, d.reject);

                return d.promise;
            };

            HTTPCache.prototype.checkCleanCache = function () {
                var _this = this;
                var d = Q.defer();
                if (!this._init || !this.opts.allowClean || !xm.isNumber(this.opts.cacheCleanInterval)) {
                    d.resolve();
                    return d.promise;
                }
                if (this.cacheSweepLast && this.cacheSweepLast.getTime() > Date.now() - this.opts.cacheCleanInterval) {
                    this.track.skip(HTTPCache.check_cache_clean, this.storeDir);
                    d.resolve();
                    return d.promise;
                }

                this.track.event(HTTPCache.check_cache_clean, this.storeDir);

                var manageInfo;

                FS.exists(this.manageFile).then(function (exists) {
                    if (!exists) {
                        return;
                    }
                    return FS.read(_this.manageFile).then(function (buffer) {
                        return _this.manageKoder.decode(buffer).then(function (info) {
                            manageInfo = info;
                        }).fail(function (err) {
                            _this.track.logger.warn('removing bad manageFile: ' + _this.manageFile + ' -> ' + err.message);
                            return xm.file.removeFile(_this.manageFile).fail(function (err) {
                                _this.track.event(HTTPCache.ignore_error, err.message, err);
                            });
                        });
                    });
                }).then(function () {
                    if (manageInfo) {
                        var date = new Date(manageInfo.lastSweep);
                        if (date.getTime() > Date.now() - _this.opts.cacheCleanInterval) {
                            return;
                        }
                    }
                    return _this.cleanupCacheAge(_this.opts.cacheCleanInterval).then(function () {
                        _this.cacheSweepLast = new Date();
                        if (!manageInfo) {
                            manageInfo = {
                                lastSweep: _this.cacheSweepLast.toISOString()
                            };
                        } else {
                            manageInfo.lastSweep = _this.cacheSweepLast.toISOString();
                        }
                        return _this.manageKoder.encode(manageInfo).then(function (buffer) {
                            return FS.write(_this.manageFile, buffer);
                        });
                    });
                }).done(function () {
                    d.resolve();
                }, d.reject);

                return d.promise;
            };

            HTTPCache.prototype.cleanupCacheAge = function (maxAge) {
                var _this = this;
                xm.assertVar(maxAge, 'number', 'maxAge');

                var d = Q.defer();
                this.track.promise(d.promise, HTTPCache.clean_cache_age);

                this.init().then(function () {
                    var limit = Date.now() - maxAge;

                    return FS.listTree(_this.storeDir, function (src, stat) {
                        if (stat.node.isFile()) {
                            var ext = path.extname(src);
                            if (ext !== '.json') {
                                return false;
                            }
                            var name = path.basename(src, ext);
                            if (!xm.isSha(name)) {
                                return false;
                            }
                            if (stat.node.atime.getTime() > limit) {
                                return false;
                            }

                            return true;
                        }
                        return false;
                    }).then(function (tree) {
                        return Q.all(tree.map(function (src) {
                            return Q.all([
                                xm.file.removeFile(src),
                                xm.file.removeFile(src.replace(/\.json$/, '.raw'))
                            ]).then(function () {
                                d.notify('dropped from cache: ' + src);
                            }, function (err) {
                                _this.track.event(HTTPCache.ignore_error, err.message, err);
                            });
                        }));
                    });
                }).done(function () {
                    d.resolve();
                }, d.reject);

                return d.promise;
            };

            Object.defineProperty(HTTPCache.prototype, "verbose", {
                set: function (verbose) {
                    this.track.logEnabled = verbose;
                },
                enumerable: true,
                configurable: true
            });
            HTTPCache.get_object = 'get_object';
            HTTPCache.drop_job = 'drop_job';
            HTTPCache.cache_clean = 'cache_clean';

            HTTPCache.check_cache_clean = 'check_cache_clean';
            HTTPCache.clean_cache_age = 'clean_cache_age';

            HTTPCache.dir_create = 'dir_create';
            HTTPCache.dir_exists = 'dir_exists';
            HTTPCache.dir_error = 'dir_error';

            HTTPCache.ignore_error = 'ignore_error';
            return HTTPCache;
        })();
        http.HTTPCache = HTTPCache;
    })(xm.http || (xm.http = {}));
    var http = xm.http;
})(xm || (xm = {}));
var git;
(function (git) {
    'use strict';

    var path = require('path');

    var GithubLoader = (function () {
        function GithubLoader(repo, options, storeDir, prefix, label) {
            this.label = 'github-loader';
            this.formatVersion = '0.0.0';
            this.headers = {};
            xm.assertVar(repo, git.GithubRepo, 'repo');
            xm.assertVar(options, xm.JSONPointer, 'options');
            xm.assertVar(storeDir, 'string', 'storeDir');

            this.repo = repo;
            this.options = options;
            this.storeDir = storeDir;
            this.label = label;
            this.track = new xm.EventLog(prefix, label);
        }
        GithubLoader.prototype._initGithubLoader = function (lock) {
            var opts = new xm.http.CacheOpts();
            opts.allowClean = this.options.getBoolean('allowClean', opts.allowClean);
            opts.cacheCleanInterval = this.options.getDurationSecs('cacheCleanInterval', opts.cacheCleanInterval / 1000) * 1000;
            opts.splitDirLevel = this.options.getNumber('splitDirLevel', opts.splitDirLevel);
            opts.splitDirChunk = this.options.getNumber('splitDirChunk', opts.splitDirChunk);
            opts.jobTimeout = this.options.getDurationSecs('jobTimeout', opts.jobTimeout / 1000) * 1000;

            this.cache = new xm.http.HTTPCache(path.join(this.storeDir, this.getCacheKey()), opts);

            xm.object.lockProps(this, ['repo', 'cache', 'options', 'storeDir', 'track', 'label', 'formatVersion']);
            if (lock) {
                xm.object.lockProps(this, lock);
            }

            this.headers['user-agent'] = this.label + '-v' + this.formatVersion;
        };

        GithubLoader.prototype.getCacheKey = function () {
            return 'loader';
        };

        GithubLoader.prototype.copyHeadersTo = function (target, source) {
            source = (source || this.headers);
            Object.keys(source).forEach(function (name) {
                target[name] = source[name];
            });
        };

        Object.defineProperty(GithubLoader.prototype, "verbose", {
            set: function (verbose) {
                this.track.logEnabled = verbose;
                this.cache.verbose = verbose;
            },
            enumerable: true,
            configurable: true
        });
        return GithubLoader;
    })();
    git.GithubLoader = GithubLoader;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    function pad(input) {
        var r = String(input);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    var GitRateInfo = (function () {
        function GitRateInfo(map) {
            this.limit = 0;
            this.remaining = 0;
            this.resetAt = '';
            this.readFromRes(map);
        }
        GitRateInfo.prototype.readFromRes = function (map) {
            if (xm.isObject(map)) {
                if (map['x-ratelimit-limit']) {
                    this.limit = parseInt(map['x-ratelimit-limit'], 10);
                }
                if (map['x-ratelimit-remaining']) {
                    this.remaining = parseInt(map['x-ratelimit-remaining'], 10);
                }
                if (map['x-ratelimit-reset']) {
                    this.reset = parseInt(map['x-ratelimit-reset'], 10) * 1000;
                }
            }
            this.lastUpdate = Date.now();
            this.resetAt = this.getResetString();
        };

        GitRateInfo.prototype.toString = function () {
            return this.remaining + ' of ' + this.limit + (this.remaining < this.limit ? ' @ ' + this.getResetString() : '');
        };

        GitRateInfo.prototype.getResetString = function () {
            var time = this.getTimeToReset();
            if (time > 0) {
                time = time / 1000;
                var hours = Math.floor(time / 3600);
                time -= (hours * 3600);
                var mins = Math.floor(time / 60);
                var secs = Math.floor(time - (mins * 60));
                return (hours) + ':' + pad(mins) + ':' + pad(secs);
            }
            if (this.limit > 0) {
                return '<limit expired>';
            }
            return '<no known limit>';
        };

        GitRateInfo.prototype.getTimeToReset = function () {
            if (this.reset) {
                return Math.max(0, this.reset - Date.now());
            }
            return 0;
        };

        GitRateInfo.prototype.getMinutesToReset = function () {
            if (this.reset) {
                return Math.floor(this.getTimeToReset() / 1000 / 60);
            }
            return 0;
        };

        GitRateInfo.prototype.isBlocked = function () {
            return this.remaining === 0;
        };

        GitRateInfo.prototype.isLimited = function () {
            return this.limit > 0 && this.remaining < this.limit;
        };

        GitRateInfo.prototype.hasRemaining = function () {
            return this.remaining > 0;
        };
        return GitRateInfo;
    })();
    git.GitRateInfo = GitRateInfo;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var HTTP = require('q-io/http');

    var GithubAPI = (function (_super) {
        __extends(GithubAPI, _super);
        function GithubAPI(repo, options, storeDir) {
            _super.call(this, repo, options, storeDir, 'github-api', 'GithubAPI');
            this.apiVersion = '3.0.0';

            this.formatVersion = '1.0';

            this._initGithubLoader(['apiVersion']);
        }
        GithubAPI.prototype.getBranches = function () {
            return this.getCachableURL(this.repo.urls.apiBranches());
        };

        GithubAPI.prototype.getBranch = function (branch) {
            return this.getCachableURL(this.repo.urls.apiBranch(branch));
        };

        GithubAPI.prototype.getTree = function (sha, recursive) {
            return this.getCachableURL(this.repo.urls.apiTree(sha, (recursive ? 1 : undefined)));
        };

        GithubAPI.prototype.getCommit = function (sha) {
            return this.getCachableURL(this.repo.urls.apiCommit(sha));
        };

        GithubAPI.prototype.getBlob = function (sha) {
            return this.getCachableURL(this.repo.urls.apiBlob(sha));
        };

        GithubAPI.prototype.getPathCommits = function (path) {
            return this.getCachableURL(this.repo.urls.apiPathCommits(path));
        };

        GithubAPI.prototype.getCachableURL = function (url) {
            var request = new xm.http.CacheRequest(url);
            return this.getCachable(request, true);
        };

        GithubAPI.prototype.getCachable = function (request, addMeta) {
            var koder = xm.JSONKoder.main;
            var d = Q.defer();
            this.track.promise(d.promise, GithubAPI.get_cachable, request.url);

            if (!xm.isNumber(request.localMaxAge)) {
                request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
            }
            if (!xm.isNumber(request.httpInterval)) {
                request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
            }
            this.copyHeadersTo(request.headers);

            request.headers['accept'] = 'application/vnd.github.beta+json';

            request.lock();

            this.cache.getObject(request).progress(d.notify).then(function (object) {
                return koder.decode(object.body).then(function (res) {
                    if (object.response) {
                        var rate = new git.GitRateInfo(object.response.headers);
                        d.notify({
                            message: rate.toString(),
                            data: rate
                        });
                    }
                    if (addMeta && xm.isObject(res)) {
                        res.meta = { rate: rate };
                    }
                    return res;
                });
            }).then(d.resolve, d.reject).done();

            return d.promise;
        };

        GithubAPI.prototype.getRateInfo = function () {
            var url = this.repo.urls.rateLimit();
            var d = Q.defer();
            this.track.promise(d.promise, GithubAPI.get_rate, url);

            var req = HTTP.normalizeRequest(url);
            this.copyHeadersTo(req.headers);

            d.notify({
                message: 'get url: ' + url
            });
            var httpPromise = HTTP.request(req).then(function (res) {
                var rate = new git.GitRateInfo(res.headers);
                d.resolve(rate);
            }, d.reject).done();

            return d.promise;
        };

        GithubAPI.prototype.getCacheKey = function () {
            return 'git-api-v' + this.apiVersion + '-fmt' + this.formatVersion;
        };
        GithubAPI.get_cachable = 'get_cachable';
        GithubAPI.get_rate = 'get_rate';
        return GithubAPI;
    })(git.GithubLoader);
    git.GithubAPI = GithubAPI;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');
    var HTTP = require('q-io/http');

    var GithubRaw = (function (_super) {
        __extends(GithubRaw, _super);
        function GithubRaw(repo, options, storeDir) {
            _super.call(this, repo, options, storeDir, 'github-raw', 'GithubRaw');

            this.formatVersion = '1.0';

            this._initGithubLoader();
        }
        GithubRaw.prototype.getText = function (ref, filePath) {
            return this.getFile(ref, filePath, xm.StringKoder.utf8);
        };

        GithubRaw.prototype.getJSON = function (ref, filePath) {
            return this.getFile(ref, filePath, xm.JSONKoder.main);
        };

        GithubRaw.prototype.getBinary = function (ref, filePath) {
            return this.getFile(ref, filePath, xm.ByteKoder.main);
        };

        GithubRaw.prototype.getFile = function (ref, filePath, koder) {
            var _this = this;
            xm.assertVar(filePath, 'string', 'filePath');
            xm.assertVar(koder, 'object', 'koder');
            xm.assertVar(ref, 'string', 'ref', true);

            var d = Q.defer();

            var url = this.repo.urls.rawFile(ref, filePath);
            this.track.promise(d.promise, GithubRaw.get_file, url);

            var headers = {};
            var request = new xm.http.CacheRequest(url, headers);
            if (xm.isSha(ref)) {
                request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
                request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
            } else {
                request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
                request.httpInterval = this.options.getDurationSecs('httpIntervalRef') * 1000;
            }
            request.lock();

            this.cache.getObject(request).progress(d.notify).then(function (object) {
                _this.track.success(GithubRaw.get_file);
                return koder.decode(object.body).then(function (res) {
                    d.resolve(res);
                });
            }).fail(d.reject).done();

            return d.promise;
        };

        GithubRaw.prototype.getCacheKey = function () {
            return 'git-raw-fmt' + this.formatVersion;
        };
        GithubRaw.get_file = 'get_file';
        return GithubRaw;
    })(git.GithubLoader);
    git.GithubRaw = GithubRaw;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var path = require('path');

    var GithubRepo = (function () {
        function GithubRepo(config, storeDir, opts) {
            xm.assertVar(config, 'object', 'config');
            xm.assertVar(storeDir, 'string', 'storeDir');
            xm.assertVar(opts, xm.JSONPointer, 'opts');

            this.config = config;
            this.urls = new git.GithubURLs(this);

            this.storeDir = path.join(storeDir.replace(/[\\\/]+$/, ''), this.getCacheKey());

            this.api = new git.GithubAPI(this, opts.getChild('git/api'), this.storeDir);
            this.raw = new git.GithubRaw(this, opts.getChild('git/raw'), this.storeDir);

            var proxy = (opts.getString('proxy') || process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy);

            this.api.cache.proxy = proxy;
            this.raw.cache.proxy = proxy;

            xm.object.lockProps(this, Object.keys(this));
        }
        GithubRepo.prototype.getCacheKey = function () {
            return this.config.repoOwner + '-' + this.config.repoProject;
        };

        GithubRepo.prototype.toString = function () {
            return this.config.repoOwner + '/' + this.config.repoProject;
        };

        Object.defineProperty(GithubRepo.prototype, "verbose", {
            set: function (verbose) {
                this.api.verbose = verbose;
                this.raw.verbose = verbose;
            },
            enumerable: true,
            configurable: true
        });
        return GithubRepo;
    })();
    git.GithubRepo = GithubRepo;
})(git || (git = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Options = (function () {
        function Options() {
            this.minMatches = 0;
            this.maxMatches = 0;
            this.limitApi = 5;
            this.resolveDependencies = false;
            this.overwriteFiles = false;
            this.saveToConfig = false;
            this.addToBundles = [];
            this.timeout = 10000;
        }
        Options.fromJSON = function (json) {
            var opts = new Options();
            if (json) {
                Object.keys(opts).forEach(function (key) {
                    if (key in json) {
                        xm.assertVar(json[key], xm.typeOf(opts[key]), 'json[' + key + ']');
                        opts[key] = json[key];
                    }
                });
            }
            return opts;
        };

        Options.main = Object.freeze(new Options());
        return Options;
    })();
    tsd.Options = Options;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var SubCore = (function () {
        function SubCore(core, track, label) {
            this._verbose = false;
            xm.assertVar(core, tsd.Core, 'core');
            this.core = core;
            this.track = new xm.EventLog(track, label);

            xm.object.lockProps(this, ['core', 'track']);
            xm.object.hidePrefixed(this);
        }

        Object.defineProperty(SubCore.prototype, "verbose", {
            get: function () {
                return this._verbose;
            },
            set: function (verbose) {
                this.track.logEnabled = verbose;
            },
            enumerable: true,
            configurable: true
        });
        return SubCore;
    })();
    tsd.SubCore = SubCore;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

    var DefUtil = (function () {
        function DefUtil() {
        }
        DefUtil.getDefs = function (list) {
            return list.map(function (def) {
                return def.def;
            });
        };

        DefUtil.getHeads = function (list) {
            return list.map(function (def) {
                return def.head;
            });
        };

        DefUtil.getHistoryTop = function (list) {
            return list.map(function (def) {
                if (def.history.length === 1) {
                    return def.history[0];
                } else if (def.history.length > 0) {
                    return def.history.sort(DefUtil.fileCompare)[0];
                }
                return def.head;
            });
        };

        DefUtil.getHistoryBottom = function (list) {
            return list.map(function (def) {
                if (def.history.length === 1) {
                    return def.history[0];
                } else if (def.history.length > 0) {
                    return def.history.sort(DefUtil.fileCompare)[def.history.length - 1];
                }
                return def.head;
            });
        };

        DefUtil.getLatest = function (list) {
            if (list.length === 1) {
                return list[0];
            } else if (list.length > 1) {
                return list.sort(DefUtil.fileCompare)[0];
            }
            return null;
        };

        DefUtil.getRecent = function (list) {
            if (list.length === 1) {
                return list[0];
            } else if (list.length > 1) {
                return list.sort(DefUtil.fileCompare)[list.length - 1];
            }
            return null;
        };

        DefUtil.getPaths = function (list) {
            return list.map(function (def) {
                return def.path;
            });
        };

        DefUtil.getPathsOf = function (list) {
            return list.map(function (file) {
                return file.def.path;
            });
        };

        DefUtil.uniqueDefVersion = function (list) {
            var ret = [];
            outer:
            for (var i = 0, ii = list.length; i < ii; i++) {
                var check = list[i];
                for (var j = 0, jj = ret.length; j < jj; j++) {
                    if (check.def.path === ret[j].def.path) {
                        continue outer;
                    }
                }
                ret.push(check);
            }
            return ret;
        };

        DefUtil.uniqueDefs = function (list) {
            var ret = [];
            outer:
            for (var i = 0, ii = list.length; i < ii; i++) {
                var check = list[i];
                for (var j = 0, jj = ret.length; j < jj; j++) {
                    if (check.path === ret[j].path) {
                        continue outer;
                    }
                }
                ret.push(check);
            }
            return ret;
        };

        DefUtil.extractReferenceTags = function (source) {
            var ret = [];
            var match;

            if (!referenceTagExp.global) {
                throw new Error('referenceTagExp RegExp must have global flag');
            }
            referenceTagExp.lastIndex = 0;

            while ((match = referenceTagExp.exec(source))) {
                if (match.length > 0 && match[1].length > 0) {
                    ret.push(match[1]);
                }
            }

            return ret;
        };

        DefUtil.contains = function (list, file) {
            var p = file.def.path;
            for (var i = 0, ii = list.length; i < ii; i++) {
                if (list[i].def.path === p) {
                    return true;
                }
            }
            return false;
        };

        DefUtil.containsDef = function (list, def) {
            var p = def.path;
            for (var i = 0, ii = list.length; i < ii; i++) {
                if (list[i].path === p) {
                    return true;
                }
            }
            return false;
        };

        DefUtil.mergeDependencies = function (list, target) {
            var ret = target || [];
            for (var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if (!DefUtil.contains(ret, file)) {
                    ret.push(file);
                    DefUtil.mergeDependenciesOf(file.dependencies, ret);
                }
            }
            return ret;
        };

        DefUtil.mergeDependenciesOf = function (list, target) {
            var ret = target || [];
            for (var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i].head;
                if (!DefUtil.contains(ret, file)) {
                    ret.push(file);
                    DefUtil.mergeDependenciesOf(file.dependencies, ret);
                }
            }
            return ret;
        };

        DefUtil.matchCommit = function (list, commitSha) {
            var ret = [];
            for (var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if (file.commit && file.commit.commitSha === commitSha) {
                    ret.push(file);
                }
            }
            return ret;
        };

        DefUtil.haveContent = function (list) {
            var ret = [];
            for (var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if (file.hasContent()) {
                    ret.push(file);
                }
            }
            return ret;
        };

        DefUtil.fileCompare = function (aa, bb) {
            if (!bb) {
                return 1;
            }
            if (!aa) {
                return -1;
            }
            if (aa.def.path < bb.def.path) {
                return -1;
            } else if (aa.def.path > bb.def.path) {
                return 1;
            }

            return -1;
        };

        DefUtil.defCompare = function (aa, bb) {
            if (!bb) {
                return 1;
            }
            if (!aa) {
                return -1;
            }
            if (aa.path < bb.path) {
                return -1;
            } else if (aa.path > bb.path) {
                return 1;
            }

            return -1;
        };

        DefUtil.fileCommitCompare = function (aa, bb) {
            var aaDate = aa.commit && aa.commit.changeDate;
            var bbDate = bb.commit && bb.commit.changeDate;
            if (!bbDate) {
                return 1;
            }
            if (!aaDate) {
                return -1;
            }
            return xm.date.compare(aaDate, bbDate);
        };
        return DefUtil;
    })();
    tsd.DefUtil = DefUtil;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');

    var localExp = /^\.\//;
    var leadingExp = /^\.\.\//;

    var Resolver = (function (_super) {
        __extends(Resolver, _super);
        function Resolver(core) {
            _super.call(this, core, 'resolve', 'Resolver');

            this._stash = new xm.PromiseStash();
        }
        Resolver.prototype.resolveBulk = function (list) {
            var _this = this;
            var d = Q.defer();

            this.track.promise(d.promise, Resolver.bulk);

            list = tsd.DefUtil.uniqueDefVersion(list);

            Q.all(list.map(function (file) {
                return _this.resolveDeps(file).progress(d.notify);
            })).then(function () {
                d.resolve(list);
            }, d.reject).done();

            return d.promise;
        };

        Resolver.prototype.resolveDeps = function (file) {
            var _this = this;
            if (file.solved) {
                this.track.skip(Resolver.solved);
                return Q(file)(file);
            }
            if (this._stash.has(file.key)) {
                this.track.skip(Resolver.active);
                return this._stash.promise(file.key);
            }

            var d = this._stash.defer(file.key);
            this.track.start(Resolver.resolve, file.key);

            var cleanup = function () {
                _this._stash.remove(file.key);
                _this.track.event(Resolver.remove);
            };

            Q.all([
                this.core.index.getIndex().progress(d.notify),
                this.core.content.loadContent(file).progress(d.notify)
            ]).spread(function (index, file) {
                _this.track.event(Resolver.parse);

                file.dependencies.splice(0, file.dependencies.length);

                var queued = _this.applyResolution(index, file, file.blob.content.toString(file.blob.encoding));

                file.solved = true;

                if (queued.length > 0) {
                    _this.track.event(Resolver.subload);
                    queued.forEach(function (p) {
                        p.progress(d.notify);
                    });
                    return Q.all(queued);
                } else {
                    _this.track.skip(Resolver.subload);
                }
                return null;
            }).then(function () {
                cleanup();
                d.resolve(file);
            }, function (err) {
                cleanup();
                d.reject(err);
            });

            return d.promise;
        };

        Resolver.prototype.applyResolution = function (index, file, content) {
            var _this = this;
            var refs = this.extractPaths(file, content);

            return refs.reduce(function (memo, refPath) {
                if (index.hasDef(refPath)) {
                    var dep = index.getDef(refPath);
                    file.dependencies.push(dep);
                    _this.track.event(Resolver.dep_added, dep.path);

                    if (!dep.head.solved && !_this._stash.has(dep.head.key)) {
                        _this.track.event(Resolver.dep_recurse, dep.path);

                        var p = _this.resolveDeps(dep.head);
                        memo.push(p);
                    }
                } else {
                    _this.track.warning(Resolver.dep_missing);
                    xm.log.warn('path reference not in index: ' + refPath);
                }
                return memo;
            }, []);
        };

        Resolver.prototype.extractPaths = function (file, content) {
            var _this = this;
            return tsd.DefUtil.extractReferenceTags(content).reduce(function (memo, refPath) {
                refPath = refPath.replace(localExp, '').replace(leadingExp, '');
                if (refPath.indexOf('/') < 0) {
                    refPath = file.def.project + '/' + refPath;
                }
                if (tsd.Def.isDefPath(refPath) && memo.indexOf(refPath) < 0) {
                    memo.push(refPath);
                } else {
                    _this.track.logger.warn('not a usable reference: ' + refPath);
                }
                return memo;
            }, []);
        };
        Resolver.active = 'active';
        Resolver.solved = 'solved';
        Resolver.remove = 'remove';
        Resolver.bulk = 'bulk';
        Resolver.resolve = 'resolve';
        Resolver.parse = 'parse';
        Resolver.subload = 'subload';
        Resolver.dep_recurse = 'dep_recurse';
        Resolver.dep_added = 'dep_added';
        Resolver.dep_missing = 'dep_missing';
        return Resolver;
    })(tsd.SubCore);
    tsd.Resolver = Resolver;
})(tsd || (tsd = {}));
var git;
(function (git) {
    'use strict';

    
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var GitUserCommit = (function () {
        function GitUserCommit() {
        }
        GitUserCommit.prototype.toString = function () {
            return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
        };

        GitUserCommit.fromJSON = function (json) {
            if (!json) {
                return null;
            }

            xm.assertVar(json.name, 'string', ' json.name');
            xm.assertVar(json.email, 'string', ' json.email');

            var ret = new git.GitUserCommit();
            ret.name = json.name;
            ret.email = json.email;
            ret.date = new Date(Date.parse(json.date));
            return ret;
        };
        return GitUserCommit;
    })();
    git.GitUserCommit = GitUserCommit;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var GithubUser = (function () {
        function GithubUser() {
        }
        GithubUser.prototype.toString = function () {
            return (this.login ? this.login : '<no login>') + (this.id ? '[' + this.id + ']' : '<no id>');
        };

        GithubUser.fromJSON = function (json) {
            if (!json) {
                return null;
            }
            var ret = new GithubUser();
            ret.id = parseInt(json.id, 10);
            ret.login = json.login;
            ret.avatar_url = json.avatar_url;
            return ret;
        };
        return GithubUser;
    })();
    git.GithubUser = GithubUser;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var subjectMessageExp = /^\s*(\S.*?\S?)(?:\s*[\r\n]\s*([\s\S]*?))?\s*$/;

    var GitCommitMessage = (function () {
        function GitCommitMessage(text) {
            if (typeof text === "undefined") { text = null; }
            if (text) {
                this.parse(this.text);
            }
        }
        GitCommitMessage.prototype.parse = function (text) {
            this.text = String(text).replace(/(^\s+)|(\s+$)/g, '');
            this.subject = '';
            this.body = '';
            subjectMessageExp.lastIndex = 0;
            var match = subjectMessageExp.exec(this.text);
            if (match && match.length > 1) {
                this.subject = String(match[1]);
                if (match.length > 2 && typeof match[2] === 'string' && match[2] !== '') {
                    this.body = match[2].replace(/\r\n/g, '\n');
                }
            }
        };

        GitCommitMessage.prototype.toString = function () {
            return (typeof this.subject === 'string' ? this.subject : '<no subject>');
        };
        return GitCommitMessage;
    })();
    git.GitCommitMessage = GitCommitMessage;
})(git || (git = {}));
var tsd;
(function (tsd) {
    'use strict';

    var pointer = require('json-pointer');

    var DefCommit = (function () {
        function DefCommit(commitSha) {
            this.hasMeta = false;
            this.message = new git.GitCommitMessage();
            xm.assertVar(commitSha, 'sha1', 'commitSha');

            this.commitSha = commitSha;

            xm.object.hidePrefixed(this);
            xm.object.lockProps(this, ['commitSha']);
        }
        DefCommit.prototype.parseJSON = function (commit) {
            xm.assertVar(commit, 'object', 'commit');
            xm.assert((commit.sha === this.commitSha), 'not my tree: {act}, {exp}', this.commitSha, commit.sha);

            this.hubAuthor = git.GithubUser.fromJSON(commit.author);
            this.hubCommitter = git.GithubUser.fromJSON(commit.committer);

            this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
            this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);

            this.message.parse(commit.commit.message);
            this.hasMeta = true;

            xm.object.lockProps(this, ['commitSha', 'hasMeta']);
        };

        DefCommit.prototype.hasMetaData = function () {
            return this.hasMeta;
        };

        DefCommit.prototype.toString = function () {
            return this.commitSha;
        };

        Object.defineProperty(DefCommit.prototype, "changeDate", {
            get: function () {
                if (this.gitAuthor) {
                    return this.gitAuthor.date;
                }
                if (this.gitCommitter) {
                    return this.gitCommitter.date;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefCommit.prototype, "commitShort", {
            get: function () {
                return this.commitSha ? tsd.shaShort(this.commitSha) : '<no sha>';
            },
            enumerable: true,
            configurable: true
        });
        return DefCommit;
    })();
    tsd.DefCommit = DefCommit;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var pointer = require('json-pointer');
    var commit_sha = '/commit/sha';
    var branch_tree_sha = '/commit/commit/tree/sha';

    var DefIndex = (function () {
        function DefIndex() {
            this._branchName = null;
            this._hasIndex = false;
            this._indexCommit = null;
            this._definitions = new Map();
            this._commits = new Map();
            this._blobs = new Map();
            this._versions = new Map();
            xm.object.hidePrefixed(this);
        }
        DefIndex.prototype.hasIndex = function () {
            return this._hasIndex;
        };

        DefIndex.prototype.init = function (branch, tree) {
            var _this = this;
            xm.assertVar(branch, 'object', 'branch');
            xm.assertVar(tree, 'object', 'tree');

            if (this._hasIndex) {
                return;
            }

            this._blobs.clear();
            this._commits.clear();
            this._versions.clear();
            this._definitions.clear();

            xm.assertVar(branch, 'object', 'branch');
            xm.assertVar(tree, 'object', 'tree');

            var commitSha = pointer.get(branch, commit_sha);
            var treeSha = tree.sha;
            var sha = pointer.get(branch, branch_tree_sha);

            xm.assertVar(sha, 'string', 'sha');
            xm.assertVar(treeSha, 'string', 'treeSha');
            xm.assertVar(commitSha, 'string', 'commitSha');

            if (sha !== treeSha) {
                throw new Error('branch and tree sha mismatch');
            }

            this._branchName = branch.name;

            this._indexCommit = this.procureCommit(commitSha);
            this._indexCommit.parseJSON(branch.commit);

            var def;
            var file;

            xm.eachElem(tree.tree, function (elem) {
                var char = elem.path.charAt(0);
                if (elem.type === 'blob' && char !== '.' && char !== '_' && tsd.Def.isDefPath(elem.path)) {
                    def = _this.procureDef(elem.path);
                    if (!def) {
                        return;
                    }
                    file = _this.procureVersion(def, _this._indexCommit);
                    if (!file) {
                        return;
                    }
                    if (!file.blob) {
                        file.setContent(_this.procureBlob(elem.sha));
                    }
                    def.head = file;
                }
            });
            this._hasIndex = true;
        };

        DefIndex.prototype.setHistory = function (def, commitJsonArray) {
            var _this = this;
            xm.assertVar(def, tsd.Def, 'def');
            xm.assertVar(commitJsonArray, 'array', 'commits');

            def.history = [];

            commitJsonArray.map(function (json) {
                if (!json || !json.sha) {
                    xm.log.inspect(json, 1, 'weird: json no sha');
                }
                var commit = _this.procureCommit(json.sha);
                if (!commit) {
                    xm.log.inspect('weird: no commit for sha ' + json.sha);
                    throw new Error('huh?');
                }
                if (!commit.hasMeta) {
                    commit.parseJSON(json);
                }
                def.history.push(_this.procureVersion(def, commit));
            });
        };

        DefIndex.prototype.procureCommit = function (commitSha) {
            xm.assertVar(commitSha, 'sha1', 'commitSha');

            var commit;
            if (this._commits.has(commitSha)) {
                commit = this._commits.get(commitSha);
            } else {
                commit = new tsd.DefCommit(commitSha);
                this._commits.set(commitSha, commit);
            }
            return commit;
        };

        DefIndex.prototype.procureBlob = function (blobSha) {
            xm.assertVar(blobSha, 'sha1', 'blobSha');

            var blob;
            if (this._blobs.has(blobSha)) {
                blob = this._blobs.get(blobSha);
            } else {
                blob = new tsd.DefBlob(blobSha);
                this._blobs.set(blobSha, blob);
            }
            return blob;
        };

        DefIndex.prototype.procureBlobFor = function (content) {
            xm.assertVar(content, Buffer, 'content');

            var sha = git.GitUtil.blobShaHex(content);
            var blob = this.procureBlob(sha);
            if (!blob.hasContent()) {
                blob.setContent(content);
            }
            return blob;
        };

        DefIndex.prototype.procureDef = function (path) {
            xm.assertVar(path, 'string', 'path');

            var def = null;

            if (this._definitions.has(path)) {
                def = this._definitions.get(path);
            } else {
                def = tsd.Def.getFrom(path);
                if (!def) {
                    throw new Error('cannot parse path to def: ' + path);
                }
                this._definitions.set(path, def);
            }
            return def;
        };

        DefIndex.prototype.procureVersion = function (def, commit) {
            xm.assertVar(def, tsd.Def, 'def');
            xm.assertVar(commit, tsd.DefCommit, 'commit');

            var file;

            var key = def.path + '|' + commit.commitSha;

            if (this._versions.has(key)) {
                file = this._versions.get(key);

                if (file.def !== def) {
                    throw new Error('weird: internal data mismatch: version does not belong to file: ' + file.def + ' -> ' + commit);
                }
            } else {
                file = new tsd.DefVersion(def, commit);
                this._versions.set(key, file);
            }
            return file;
        };

        DefIndex.prototype.procureVersionFromSha = function (path, commitSha) {
            xm.assertVar(path, 'string', 'path');
            xm.assertVar(commitSha, 'sha1', 'commitSha');

            var def = this.getDef(path);
            if (!def) {
                xm.log.warn('path not in index, attempt-adding: ' + path);

                def = this.procureDef(path);
            }
            if (!def) {
                throw new Error('cannot procure definition for path: ' + path);
            }

            var commit = this.procureCommit(commitSha);
            if (!commit) {
                throw new Error('cannot procure commit for path: ' + path + ' -> commit: ' + commitSha);
            }
            if (!commit.hasMetaData()) {
            }
            var file = this.procureVersion(def, commit);
            if (!file) {
                throw new Error('cannot procure definition version for path: ' + path + ' -> commit: ' + commit.commitSha);
            }

            return file;
        };

        DefIndex.prototype.getDef = function (path) {
            return this._definitions.get(path);
        };

        DefIndex.prototype.hasDef = function (path) {
            return this._definitions.has(path);
        };

        DefIndex.prototype.getBlob = function (sha) {
            return this._blobs.get(sha);
        };

        DefIndex.prototype.hasBlob = function (sha) {
            return this._blobs.has(sha);
        };

        DefIndex.prototype.getCommit = function (sha) {
            return this._commits.get(sha);
        };

        DefIndex.prototype.hasCommit = function (sha) {
            return this._commits.has(sha);
        };

        DefIndex.prototype.getPaths = function () {
            return xm.valuesOf(this._definitions).map(function (file) {
                return file.path;
            });
        };

        DefIndex.prototype.toDump = function () {
            var ret = [];
            ret.push(this.toString());
            this._definitions.forEach(function (def) {
                ret.push('  ' + def.toString());
            });
            return ret.join('\n') + '\n' + 'total ' + this._definitions.size + ' definitions';
        };

        Object.defineProperty(DefIndex.prototype, "branchName", {
            get: function () {
                return this._branchName;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefIndex.prototype, "list", {
            get: function () {
                return xm.valuesOf(this._definitions);
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(DefIndex.prototype, "indexCommit", {
            get: function () {
                return this._indexCommit;
            },
            enumerable: true,
            configurable: true
        });

        DefIndex.prototype.toString = function () {
            return '[' + this._branchName + ']';
        };
        return DefIndex;
    })();
    tsd.DefIndex = DefIndex;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var pointer = require('json-pointer');

    var branch_tree = '/commit/commit/tree/sha';

    var IndexManager = (function (_super) {
        __extends(IndexManager, _super);
        function IndexManager(core) {
            _super.call(this, core, 'index', 'IndexManager');
            this._defer = new Map();
        }
        IndexManager.prototype.getIndex = function () {
            var _this = this;
            var refKey = this.core.context.config.repoRef;
            var defer = this._defer[refKey];

            if (defer) {
                this.track.skip(IndexManager.init);

                var d = Q.defer();
                defer.promise.then(d.resolve, d.reject);
                return defer.promise;
            }
            var index = new tsd.DefIndex();

            defer = Q.defer();
            this._defer[refKey] = defer;

            this.track.promise(defer.promise, IndexManager.init, refKey);
            this.track.start(IndexManager.branch_get);

            this.core.repo.api.getBranch(this.core.context.config.ref).progress(defer.notify).then(function (branchData) {
                _this.track.complete(IndexManager.branch_get);

                if (!branchData) {
                    throw new Error('loaded empty branch data');
                }
                var sha = pointer.get(branchData, branch_tree);
                if (!sha) {
                    throw new Error('missing sha');
                }
                _this.track.start(IndexManager.tree_get);

                return _this.core.repo.api.getTree(sha, true).progress(defer.notify).then(function (data) {
                    _this.track.complete(IndexManager.tree_get);

                    index.init(branchData, data);

                    _this.track.complete(IndexManager.init);
                    defer.resolve(index);
                });
            }).fail(function (err) {
                _this.track.failure(IndexManager.init, err.message, err);
                defer.reject(err);
            }).done();

            return defer.promise;
        };

        IndexManager.prototype.procureDef = function (path) {
            var d = Q.defer();

            this.getIndex().progress(d.notify).then(function (index) {
                var def = index.procureDef(path);
                if (!def) {
                    throw new Error('cannot get def for path: ' + path);
                }
                d.resolve(def);
            }).fail(d.reject).done();

            return d.promise;
        };

        IndexManager.prototype.procureFile = function (path, commitSha) {
            var d = Q.defer();

            this.getIndex().progress(d.notify).then(function (index) {
                var file = index.procureVersionFromSha(path, commitSha);
                if (!file) {
                    throw new Error('cannot get file for path: ' + path);
                }
                d.resolve(file);
            }).fail(d.reject).done();

            return d.promise;
        };

        IndexManager.prototype.procureCommit = function (commitSha) {
            var d = Q.defer();

            this.getIndex().progress(d.notify).then(function (index) {
                var commit = index.procureCommit(commitSha);
                if (!commit) {
                    throw new Error('cannot commit def for commitSha: ' + commitSha);
                }
                d.resolve(commit);
            }).fail(d.reject).done();

            return d.promise;
        };

        IndexManager.prototype.findFile = function (path, commitShaFragment) {
            var d = Q.defer();

            d.reject('implement me!');
            return d.promise;
        };
        IndexManager.init = 'init';
        IndexManager.tree_get = 'tree_get';
        IndexManager.branch_get = 'branch_get';

        IndexManager.procure_def = 'procure_def';
        IndexManager.procure_file = 'procure_file';
        IndexManager.procure_commit = 'procure_commit';
        return IndexManager;
    })(tsd.SubCore);
    tsd.IndexManager = IndexManager;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var pointer = require('json-pointer');

    var ConfigIO = (function (_super) {
        __extends(ConfigIO, _super);
        function ConfigIO(core) {
            _super.call(this, core, 'config', 'ConfigIO');
        }
        ConfigIO.prototype.initConfig = function (overwrite) {
            var _this = this;
            var d = Q.defer();
            var target = this.core.context.paths.configFile;

            this.track.promise(d.promise, ConfigIO.config_init, target);

            FS.exists(target).then(function (exists) {
                if (exists) {
                    if (!overwrite) {
                        throw new Error('cannot overwrite file: ' + target);
                    }
                    return FS.remove(target);
                }
                return null;
            }).then(function () {
                _this.core.context.config.reset();
                return _this.saveConfig().then(function (target) {
                    d.resolve(target);
                });
            }).fail(d.reject).done();

            return d.promise;
        };

        ConfigIO.prototype.readConfig = function (optional) {
            var _this = this;
            if (typeof optional === "undefined") { optional = false; }
            var d = Q.defer();
            var target = this.core.context.paths.configFile;

            this.track.promise(d.promise, ConfigIO.config_read, target);

            FS.exists(target).then(function (exists) {
                if (!exists) {
                    if (!optional) {
                        d.reject(new Error('cannot locate file: ' + target));
                    } else {
                        d.resolve(null);
                    }
                    return;
                }
                return FS.read(target, { flags: 'r' }).then(function (json) {
                    _this.core.context.config.parseJSONString(json, target);
                    _this.core.updateConfig();
                    d.resolve(null);
                });
            }).fail(d.reject).done();

            return d.promise;
        };

        ConfigIO.prototype.saveConfig = function (target) {
            var _this = this;
            var d = Q.defer();

            target = target || this.core.context.paths.configFile;
            var dir = path.dirname(target);

            this.track.promise(d.promise, ConfigIO.config_save, target);

            xm.file.mkdirCheckQ(dir, true).then(function () {
                var output = _this.core.context.config.toJSONString();

                return FS.write(target, output).then(function () {
                    return FS.stat(target);
                }).then(function () {
                    return Q.delay(50);
                }).then(function () {
                    return FS.stat(target).then(function (stat) {
                        if (stat.size === 0) {
                            throw new Error('saveConfig written zero bytes to: ' + target + ' (looks lie');
                        }
                    });
                });
            }).then(function () {
                d.resolve(target);
            }, d.reject).done();

            return d.promise;
        };
        ConfigIO.config_init = 'config_init';
        ConfigIO.config_read = 'config_read';
        ConfigIO.config_save = 'config_save';
        return ConfigIO;
    })(tsd.SubCore);
    tsd.ConfigIO = ConfigIO;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var pointer = require('json-pointer');

    var ContentLoader = (function (_super) {
        __extends(ContentLoader, _super);
        function ContentLoader(core) {
            _super.call(this, core, 'content', 'ContentLoader');
        }
        ContentLoader.prototype.loadCommitMetaData = function (commit) {
            var d = Q.defer();
            this.track.promise(d.promise, 'commit_meta_load', commit.commitSha);

            if (commit.hasMetaData()) {
                d.resolve(commit);
                return;
            }
            this.core.repo.api.getCommit(commit.commitSha).progress(d.notify).then(function (json) {
                commit.parseJSON(json);
                d.resolve(commit);
            }).fail(d.reject);

            return d.promise;
        };

        ContentLoader.prototype.loadContent = function (file, tryHead) {
            var _this = this;
            if (typeof tryHead === "undefined") { tryHead = false; }
            if (file.hasContent()) {
                this.track.skip('content_load', file.key);
                return Q(file);
            }

            var d = Q.defer();
            this.track.promise(d.promise, 'content_load', file.key);

            this.core.index.getIndex().progress(d.notify).then(function (index) {
                var ref = file.commit.commitSha;

                if (tryHead && file.commit.commitSha === file.def.head.commit.commitSha) {
                    ref = _this.core.context.config.ref;
                }
                return _this.core.repo.raw.getBinary(ref, file.def.path).progress(d.notify).then(function (content) {
                    if (file.blob) {
                        if (!file.blob.hasContent()) {
                            try  {
                                file.blob.setContent(content);
                            } catch (err) {
                                xm.log.warn(err);
                                xm.log.debug('path', file.def.path);
                                xm.log.debug('commitSha', file.commit.commitSha);
                                xm.log.error('failed to set content');

                                throw err;
                            }
                        }
                    } else {
                        file.setContent(index.procureBlobFor(content));
                    }
                    d.resolve(file);
                });
            }).fail(d.reject);

            return d.promise;
        };

        ContentLoader.prototype.loadContentBulk = function (list) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'content_load_bulk');

            Q.all(list.map(function (file) {
                return _this.loadContent(file).progress(d.notify);
            })).then(function (list) {
                d.resolve(list);
            }, d.reject);

            return d.promise;
        };

        ContentLoader.prototype.loadHistory = function (def) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'history_load', def.path);

            if (def.history.length > 0) {
                return Q(def);
            }
            this.core.index.getIndex().progress(d.notify).then(function (index) {
                return _this.core.repo.api.getPathCommits(def.path).progress(d.notify).then(function (content) {
                    index.setHistory(def, content);
                    d.resolve(def);
                });
            }).fail(d.reject);

            return d.promise;
        };

        ContentLoader.prototype.loadHistoryBulk = function (list) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'history_load_bulk');

            list = tsd.DefUtil.uniqueDefs(list);

            Q.all(list.map(function (file) {
                return _this.loadHistory(file).progress(d.notify);
            })).then(function (list) {
                d.resolve(list);
            }, d.reject);

            return d.promise;
        };
        return ContentLoader;
    })(tsd.SubCore);
    tsd.ContentLoader = ContentLoader;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var path = require('path');
    var FS = require('q-io/fs');

    var Installer = (function (_super) {
        __extends(Installer, _super);
        function Installer(core) {
            _super.call(this, core, 'install', 'Installer');
        }
        Installer.prototype.installFile = function (file, addToConfig, overwrite) {
            var _this = this;
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            if (typeof overwrite === "undefined") { overwrite = false; }
            var d = Q.defer();
            this.track.promise(d.promise, 'file');

            this.useFile(file, overwrite).progress(d.notify).then(function (targetPath) {
                if (targetPath) {
                    if (_this.core.context.config.hasFile(file.def.path)) {
                        _this.core.context.config.getFile(file.def.path).update(file);
                    } else if (addToConfig) {
                        _this.core.context.config.addFile(file);
                    }
                }
                d.resolve(targetPath);
            }).fail(d.reject);

            return d.promise;
        };

        Installer.prototype.installFileBulk = function (list, addToConfig, overwrite) {
            var _this = this;
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            if (typeof overwrite === "undefined") { overwrite = true; }
            var d = Q.defer();
            this.track.promise(d.promise, 'file_bulk');

            var written = new Map();

            Q.all(list.map(function (file) {
                return _this.installFile(file, addToConfig, overwrite).progress(d.notify).then(function (targetPath) {
                    if (targetPath) {
                        written.set(file.def.path, file);
                    }
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };

        Installer.prototype.reinstallBulk = function (list, overwrite) {
            var _this = this;
            if (typeof overwrite === "undefined") { overwrite = false; }
            var d = Q.defer();
            this.track.promise(d.promise, 'reinstall_bulk');

            var written = new Map();

            Q.all(list.map(function (installed) {
                return _this.core.index.procureFile(installed.path, installed.commitSha).progress(d.notify).then(function (file) {
                    return _this.installFile(file, true, overwrite).progress(d.notify).then(function (targetPath) {
                        if (targetPath) {
                            written.set(file.def.path, file);
                        }
                        return file;
                    });
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };

        Installer.prototype.useFile = function (file, overwrite) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'use', file.key);

            var targetPath = this.core.getInstallPath(file.def);

            xm.file.canWriteFile(targetPath, overwrite).then(function (canWrite) {
                if (!canWrite) {
                    if (!overwrite) {
                        d.notify(xm.getNote('skipped existing: ' + file.def.path));
                    }
                    d.resolve(null);
                    return;
                }

                return _this.core.content.loadContent(file).progress(d.notify).then(function () {
                    return FS.exists(targetPath);
                }).then(function (exists) {
                    if (exists) {
                        return FS.remove(targetPath);
                    }
                }).then(function () {
                    return xm.file.mkdirCheckQ(path.dirname(targetPath), true);
                }).then(function () {
                    return FS.write(targetPath, file.blob.content);
                }).then(function () {
                    d.resolve(targetPath);
                });
            }).fail(d.reject);

            return d.promise;
        };

        Installer.prototype.useFileBulk = function (list, overwrite) {
            var _this = this;
            if (typeof overwrite === "undefined") { overwrite = true; }
            var d = Q.defer();
            this.track.promise(d.promise, 'use_bulk');

            list = tsd.DefUtil.uniqueDefVersion(list);

            var written = new Map();

            Q.all(list.map(function (file) {
                return _this.useFile(file, overwrite).progress(d.notify).then(function (targetPath) {
                    if (targetPath) {
                        written.set(file.def.path, file);
                    }
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };
        return Installer;
    })(tsd.SubCore);
    tsd.Installer = Installer;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');
    var trimmedLine = /([ \t]*)(.*?)([ \t]*)(\r\n|\n|\r|$)/g;

    var LineParserCore = (function () {
        function LineParserCore(verbose) {
            if (typeof verbose === "undefined") { verbose = false; }
            this.verbose = verbose;
            this.parsers = new Map();
        }
        LineParserCore.prototype.addParser = function (parser) {
            this.parsers.set(parser.id, parser);
        };

        LineParserCore.prototype.getInfo = function () {
            var ret = {};
            ret.parsers = xm.keysOf(this.parsers).sort();
            return ret;
        };

        LineParserCore.prototype.getParser = function (id) {
            return this.parsers.get(id);
        };

        LineParserCore.prototype.link = function () {
            var _this = this;
            this.parsers.forEach(function (parser) {
                xm.eachElem(parser.nextIds, function (id) {
                    var p = _this.parsers.get(id);
                    if (p) {
                        parser.next.push(p);
                    } else {
                        console.log('cannot find parser: ' + id);
                    }
                });
            });
        };

        LineParserCore.prototype.get = function (ids) {
            var _this = this;
            return xm.reduceArray(ids, [], function (memo, id) {
                if (!_this.parsers.has(id)) {
                    console.log('missing parser ' + id);
                    return memo;
                }
                memo.push(_this.parsers.get(id));
                return memo;
            });
        };

        LineParserCore.prototype.all = function () {
            return xm.valuesOf(this.parsers);
        };

        LineParserCore.prototype.listIds = function (parsers) {
            return xm.reduceArray(parsers, [], function (memo, parser) {
                memo.push(parser.id);
                return memo;
            });
        };

        LineParserCore.prototype.parse = function (source, asType) {
            var log = this.verbose ? function () {
                var rest = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    rest[_i] = arguments[_i + 0];
                }
                console.log.apply(console, rest);
            } : function () {
                var rest = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    rest[_i] = arguments[_i + 0];
                }
            };

            log('source.length: ' + source.length);
            log('asType: ' + asType);

            this.link();

            var res = [];
            var possibles = asType ? this.get(asType) : this.all();

            var length = source.length;
            var line;
            var i, ii;
            var offset = 0;
            var cursor = 0;
            var lineCount = 0;
            var procLineCount = 0;

            var safetyBreak = 20;

            trimmedLine.lastIndex = 0;
            while (line = trimmedLine.exec(source)) {
                log('-----------------------------------------------------------------------------------------');

                if (line[0].length === 0) {
                    console.log('zero length line match?');
                    break;
                }
                if (line.index + line[0].length === cursor) {
                    console.log('cursor not advancing?');
                    break;
                }

                cursor = line.index + line[0].length;
                trimmedLine.lastIndex = cursor;

                lineCount++;
                log('line: ' + lineCount);

                if (lineCount > safetyBreak) {
                    console.log('\n\n\n\nsafetyBreak bail at ' + lineCount + '> ' + safetyBreak + '!\n\n\n\n\n');
                    throw ('parser safetyBreak bail!');
                }

                if (line.length < 5) {
                    log('skip bad line match');
                } else if (typeof line[2] === 'undefined' || line[2] === '') {
                    log('skip empty line');
                } else {
                    procLineCount++;

                    var text = line[2];
                    log('[[' + text + ']]');
                    log('---');

                    var choice = [];

                    for (i = 0, ii = possibles.length; i < ii; i++) {
                        var parser = possibles[i];
                        var match = parser.match(text, offset, cursor);
                        if (match) {
                            log(parser.getName() + ' -> match!');
                            log(match.match);
                            choice.push(match);

                            break;
                        } else {
                            log(parser.getName());
                        }
                    }

                    log('---');

                    log('choices ' + choice.length);

                    if (choice.length === 0) {
                        log('cannot match line');
                        break;
                    } else if (choice.length === 1) {
                        log('single match line');
                        log('using ' + choice[0].parser.id);

                        res.push(choice[0]);
                        possibles = choice[0].parser.next;
                        log('switching possibles: [' + this.listIds(possibles) + ']');
                    } else {
                        log('multi match line');
                        log('using ' + choice[0].parser.id);

                        res.push(choice[0]);
                        possibles = choice[0].parser.next;
                        log('switching possibles: [' + this.listIds(possibles) + ']');
                    }
                }

                if (possibles.length === 0) {
                    log('no more possibles, break');
                    break;
                }
                if (cursor >= length) {
                    log('done ' + cursor + ' >= ' + length + ' lineCount: ' + lineCount);
                    break;
                }
            }
            log('--------------');

            log('total lineCount: ' + lineCount);
            log('procLineCount: ' + procLineCount);

            log('res.length: ' + res.length);
            log(' ');

            if (res.length > 0) {
                res.forEach(function (match) {
                    match.extract();
                });
            }
        };
        return LineParserCore;
    })();
    xm.LineParserCore = LineParserCore;

    var LineParser = (function () {
        function LineParser(id, exp, groupsMin, callback, nextIds) {
            if (typeof nextIds === "undefined") { nextIds = []; }
            this.id = id;
            this.exp = exp;
            this.groupsMin = groupsMin;
            this.callback = callback;
            this.nextIds = nextIds;
            this.next = [];
        }
        LineParser.prototype.match = function (str, offset, limit) {
            this.exp.lastIndex = offset;
            var match = this.exp.exec(str);
            if (!match || match.length < 1) {
                return null;
            }

            if (this.groupsMin >= 0 && match.length < this.groupsMin) {
                throw (new Error(this.getName() + 'bad match expected ' + this.groupsMin + ' groups, got ' + (this.match.length - 1)));
            }
            return new LineParserMatch(this, match);
        };

        LineParser.prototype.getName = function () {
            return this.id;
        };
        return LineParser;
    })();
    xm.LineParser = LineParser;

    var LineParserMatch = (function () {
        function LineParserMatch(parser, match) {
            this.parser = parser;
            this.match = match;
        }
        LineParserMatch.prototype.extract = function () {
            if (this.parser.callback) {
                this.parser.callback(this);
            }
        };

        LineParserMatch.prototype.getGroup = function (num, alt) {
            if (typeof alt === "undefined") { alt = ''; }
            if (num >= this.match.length - 1) {
                throw (new Error(this.parser.getName() + ' group index ' + num + ' > ' + (this.match.length - 2)));
            }

            num += 1;
            if (num < 1 || num > this.match.length) {
                return alt;
            }
            if (typeof this.match[num] === 'undefined') {
                return alt;
            }
            return this.match[num];
        };

        LineParserMatch.prototype.getGroupFloat = function (num, alt) {
            if (typeof alt === "undefined") { alt = 0; }
            var value = parseFloat(this.getGroup(num));
            if (isNaN(value)) {
                return alt;
            }
            return value;
        };

        LineParserMatch.prototype.getName = function () {
            return this.parser.getName();
        };
        return LineParserMatch;
    })();
    xm.LineParserMatch = LineParserMatch;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var endSlashTrim = /\/?$/;

    var glue = xm.RegExpGlue.get;

    var expStart = /^/;
    var expEnd = /$/;
    var spaceReq = /[ \t]+/;
    var spaceOpt = /[ \t]*/;

    var anyGreedy = /.*/;
    var anyLazy = /.*?/;

    var anyGreedyCap = /(.*)/;
    var anyLazyCap = /(.*?)/;

    var identifierCap = /(\w+(?:[ \w\.-]*?\w)*?)/;
    var versionCap = /(?:[ \t:-]?v?(\d+\.\d+\.?\d*\.?\d*))?/;
    var semwerCap = /[ \(-]+v?(\d+(?:\.\d+)*(?:-[\w-]+(?:\.[\w-]+)?)?)\)?/;
    var wordsCap = /([\w \t-]+[\w]+)/;
    var labelCap = /([\w-]+[\w]+)/;

    var delimStart = /[<\[\{\(]/;
    var delimStartOpt = /[<\[\{\(]?/;
    var delimEnd = /[\)\}\]>]/;
    var delimEndOpt = /[\)\}\]>]?/;

    var seperatorOpt = /[,;]?/;

    var uft8bom = /\uFEFF/;
    var uft8bomOpt = /\uFEFF?/;

    var urlGroupsCap = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/;
    var urlFullCap = /((?:(?:[A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)(?:(?:\/[\+~%\/\.\w\-]*)?\??(?:[\-\+=&;%@\.\w]*)#?(?:[\.\!\/\\\w]*))?)/;

    var charsIntl = /[0-9A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02af\u1d00-\u1d25\u1d62-\u1d65\u1d6b-\u1d77\u1d79-\u1d9a\u1e00-\u1eff\u2090-\u2094\u2184-\u2184\u2488-\u2490\u271d-\u271d\u2c60-\u2c7c\u2c7e-\u2c7f\ua722-\ua76f\ua771-\ua787\ua78b-\ua78c\ua7fb-\ua7ff\ufb00-\ufb06]+/;

    var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

    var commentStart = glue(expStart, spaceOpt, /\/\/+/, spaceOpt).join();
    var commentStartFirst = glue(expStart, uft8bomOpt, spaceOpt, /\/\/+/, spaceOpt).join();
    var optUrl = glue('(?:', spaceOpt, delimStartOpt, urlFullCap, delimEndOpt, ')?').join();

    var wordsIntlCap = glue('(', charsIntl, '(?:', /[ _-]+/, charsIntl, ')*', ')').join();

    var wordy = /[^ \t\<\(\{\{,;:]+/;
    var nameHackyCap = glue('(', wordy, '(?:', / /, wordy, ')*', ')').join();

    var commentLine = glue(commentStartFirst).append(anyLazyCap).append(spaceOpt, expEnd).join();

    var referencePath = glue(expStart, uft8bomOpt, spaceOpt, /\/\/+/, spaceOpt).append(referenceTag).append(spaceOpt, expEnd).join();

    var typeHead = glue(commentStartFirst).append(/Type definitions?/, spaceOpt, /(?:for)?:?/, spaceOpt, anyLazyCap, spaceOpt).append(expEnd).join('i');

    var projectUrl = glue(commentStart).append(/Project/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var defAuthorUrl = glue(commentStart).append(/Definitions[ \t]+by[ \t]*:?/, spaceOpt).append(nameHackyCap, optUrl).append(spaceOpt, anyLazyCap, spaceOpt, expEnd).join('i');

    var defAuthorFollow = glue(commentStart).append(/[ \t]*/, spaceOpt).append(nameHackyCap, optUrl).append(spaceOpt, anyLazyCap, spaceOpt, expEnd).join('i');

    var defAuthorUrlRest = glue(spaceOpt).append(/(?:,|(?:and))/, spaceOpt).append(nameHackyCap, optUrl).append(spaceOpt).join('gi');

    var reposUrl = glue(commentStart).append(/Definitions/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var reposUrlAlt = glue(commentStart).append(/DefinitelyTyped/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var labelUrl = glue(commentStart).append(labelCap, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var labelWordsUrl = glue(commentStart).append(labelCap, spaceOpt, /:?/, spaceOpt).append(wordsCap, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var wordsUrl = glue(commentStart).append(wordsCap, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    function mutate(base, add, remove) {
        var res = (base ? base.slice(0) : []);
        var i, ii, index;
        if (add) {
            for (i = 0, ii = add.length; i < ii; i++) {
                res.push(add[i]);
            }
        }
        if (remove) {
            for (i = 0, ii = remove.length; i < ii; i++) {
                while ((index = res.indexOf(remove[i])) > -1) {
                    res.splice(index, 1);
                }
            }
        }
        return res;
    }

    var DefInfoParser = (function () {
        function DefInfoParser(verbose) {
            if (typeof verbose === "undefined") { verbose = false; }
            this.verbose = verbose;
        }
        DefInfoParser.prototype.parse = function (data, source) {
            data.resetFields();

            this.parser = new xm.LineParserCore(this.verbose);

            var fields = ['projectUrl', 'defAuthorUrl', 'reposUrl', 'reposUrlAlt', 'referencePath'];

            this.parser.addParser(new xm.LineParser('any', anyGreedyCap, 0, null, ['head', 'any']));

            this.parser.addParser(new xm.LineParser('head', typeHead, 1, function (match) {
                data.name = match.getGroup(0, data.name);

                semwerCap.lastIndex = 0;
                var sub = semwerCap.exec(data.name);
                if (sub) {
                    data.version = sub[1];
                }
            }, fields));

            fields = mutate(fields, null, ['projectUrl']);

            this.parser.addParser(new xm.LineParser('projectUrl', projectUrl, 1, function (match) {
                data.projectUrl = match.getGroup(0, data.projectUrl).replace(endSlashTrim, '');
            }, fields));

            fields = mutate(fields, ['defAuthorFollow'], null);

            var author = function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));

                var rest = match.getGroup(2);
                var sub;
                if (rest.length > 0) {
                    defAuthorUrlRest.lastIndex = 0;
                    while (sub = defAuthorUrlRest.exec(rest)) {
                        defAuthorUrlRest.lastIndex = sub.index + sub[0].length + 1;
                        if (sub.length > 1) {
                            data.authors.push(new xm.AuthorInfo(sub[1], sub[2]));
                        }
                    }
                }
            };
            this.parser.addParser(new xm.LineParser('defAuthorUrl', defAuthorUrl, 3, author, fields));
            this.parser.addParser(new xm.LineParser('defAuthorFollow', defAuthorFollow, 3, author, fields));

            fields = mutate(fields, null, ['defAuthorUrl', 'defAuthorFollow']);

            fields = mutate(fields, null, ['reposUrl', 'reposUrlAlt']);

            this.parser.addParser(new xm.LineParser('reposUrl', reposUrl, 1, function (match) {
                data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
            }, fields));

            this.parser.addParser(new xm.LineParser('reposUrlAlt', reposUrlAlt, 1, function (match) {
                data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
            }, fields));

            this.parser.addParser(new xm.LineParser('referencePath', referencePath, 1, function (match) {
                data.references.push(match.getGroup(0));
            }, ['referencePath']));

            this.parser.addParser(new xm.LineParser('comment', commentLine, 0, null, ['comment']));

            if (this.verbose) {
                xm.log(this.parser.getInfo());
            }

            this.parser.parse(source, ['head']);
        };
        return DefInfoParser;
    })();
    tsd.DefInfoParser = DefInfoParser;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');

    var InfoParser = (function (_super) {
        __extends(InfoParser, _super);
        function InfoParser(core) {
            _super.call(this, core, 'info', 'InfoParser');
        }
        InfoParser.prototype.parseDefInfo = function (file) {
            var d = Q.defer();
            this.track.promise(d.promise, 'parse', file.key);

            this.core.content.loadContent(file).progress(d.notify).then(function (file) {
                var parser = new tsd.DefInfoParser();
                if (file.info) {
                    file.info.resetFields();
                } else {
                    file.info = new tsd.DefInfo();
                }

                parser.parse(file.info, file.blob.content.toString('utf8'));

                if (!file.info.isValid()) {
                }
                d.resolve(file);
            }).fail(d.reject);

            return d.promise;
        };

        InfoParser.prototype.parseDefInfoBulk = function (list) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'parse_bulk');

            list = tsd.DefUtil.uniqueDefVersion(list);

            Q.all(list.map(function (file) {
                return _this.parseDefInfo(file).progress(d.notify);
            })).then(function (list) {
                d.resolve(list);
            }, d.reject);

            return d.promise;
        };
        return InfoParser;
    })(tsd.SubCore);
    tsd.InfoParser = InfoParser;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Selection = (function () {
        function Selection(query) {
            if (typeof query === "undefined") { query = null; }
            xm.assertVar(query, tsd.Query, 'query', true);
            this.query = query;

            xm.object.lockProps(this, ['query']);
        }
        return Selection;
    })();
    tsd.Selection = Selection;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var path = require('path');
    var FS = require('q-io/fs');
    var pointer = require('json-pointer');

    var SelectorQuery = (function (_super) {
        __extends(SelectorQuery, _super);
        function SelectorQuery(core) {
            _super.call(this, core, 'select', 'Select');
        }
        SelectorQuery.prototype.select = function (query, options) {
            var _this = this;
            var d = Q.defer();

            this.track.promise(d.promise, 'select');

            var res = new tsd.Selection(query);

            this.core.index.getIndex().progress(d.notify).then(function (index) {
                return Q().then(function () {
                    res.definitions = query.patterns.reduce(function (memo, names) {
                        names.filter(index.list, memo).forEach(function (def) {
                            if (!tsd.DefUtil.containsDef(memo, def)) {
                                memo.push(def);
                            }
                        });
                        return memo;
                    }, []);

                    if (query.versionMatcher) {
                        res.definitions = query.versionMatcher.filter(res.definitions);
                    }

                    res.selection = tsd.DefUtil.getHeads(res.definitions);

                    if (options.minMatches > 0 && res.definitions.length < options.minMatches) {
                        throw new Error('expected more matches: ' + res.definitions.length + ' < ' + options.minMatches);
                    }
                    if (options.maxMatches > 0 && res.definitions.length > options.maxMatches) {
                        throw new Error('expected less matches: ' + res.definitions.length + ' > ' + options.maxMatches);
                    }
                }).then(function () {
                    if (query.requiresHistory) {
                        if (options.limitApi > 0 && res.definitions.length > options.limitApi) {
                            throw new Error('match count ' + res.definitions.length + ' over api limit ' + options.limitApi);
                        }

                        return _this.core.content.loadHistoryBulk(res.definitions).progress(d.notify).then(function () {
                            if (query.commitMatcher) {
                                res.selection = [];
                                res.definitions.forEach(function (def) {
                                    def.history = query.commitMatcher.filter(def.history);
                                    if (def.history.length > 0) {
                                        res.selection.push(tsd.DefUtil.getLatest(def.history));
                                    }
                                });
                                res.definitions = tsd.DefUtil.getDefs(res.selection);
                            }
                            if (query.dateMatcher) {
                                res.selection = [];
                                res.definitions.forEach(function (def) {
                                    def.history = query.dateMatcher.filter(def.history);
                                    if (def.history.length > 0) {
                                        res.selection.push(tsd.DefUtil.getLatest(def.history));
                                    }
                                });
                                res.definitions = tsd.DefUtil.getDefs(res.selection);
                            }
                        });
                    }
                    return null;
                }).then(function () {
                    if (query.requiresSource) {
                        return _this.core.content.loadContentBulk(res.selection).progress(d.notify);
                    }
                    return null;
                }).then(function () {
                    if (query.parseInfo || query.infoMatcher) {
                        return _this.core.parser.parseDefInfoBulk(res.selection).progress(d.notify);
                    }
                    return null;
                }).then(function () {
                    if (query.infoMatcher) {
                        res.selection = query.infoMatcher.filter(res.selection);
                        res.definitions = tsd.DefUtil.getDefs(res.selection);
                    }
                    return null;
                }).then(function () {
                    if (options.resolveDependencies) {
                        return _this.core.resolver.resolveBulk(res.selection).progress(d.notify);
                    }
                    return null;
                });
            }).then(function () {
                d.resolve(res);
            }, d.reject).done();

            return d.promise;
        };
        return SelectorQuery;
    })(tsd.SubCore);
    tsd.SelectorQuery = SelectorQuery;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');
    var splitExp = /(?:(.*)(\r?\n))|(?:(.+)($))/g;

    var referenceTagExp = /\/\/\/[ \t]+<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

    var Bundle = (function () {
        function Bundle(target, baseDir) {
            this.eol = '\n';
            xm.assertVar(target, 'string', 'target');
            this.target = target.replace(/^\.\//, '');
            this.baseDir = baseDir || path.dirname(this.target);
        }
        Bundle.prototype.parse = function (content) {
            this.head = null;
            this.eol = '\n';

            var lineMatch;
            var refMatch;
            var line;
            var prev = null;

            var eolWin = 0;
            var eolNix = 0;

            splitExp.lastIndex = 0;
            while ((lineMatch = splitExp.exec(content))) {
                splitExp.lastIndex = lineMatch.index + lineMatch[0].length;

                line = new BundleLine(lineMatch[1]);
                if (prev) {
                    line.prev = prev;
                    prev.next = line;
                }
                prev = line;
                if (!this.head) {
                    this.head = line;
                }

                if (/\r\n/.test(lineMatch[2])) {
                    eolWin++;
                } else {
                    eolNix++;
                }

                referenceTagExp.lastIndex = 0;
                refMatch = referenceTagExp.exec(lineMatch[1]);
                if (refMatch && refMatch.length > 1) {
                    line.ref = path.resolve(this.baseDir, refMatch[1]);
                }
            }

            this.eol = (eolWin > eolNix ? '\r\n' : '\n');
        };

        Bundle.prototype.has = function (ref) {
            ref = path.resolve(this.baseDir, ref);

            var line = this.head;
            while (line) {
                if (line.ref === ref) {
                    return true;
                }
                line = line.next;
            }
            return false;
        };

        Bundle.prototype.append = function (ref) {
            ref = path.resolve(this.baseDir, ref);

            if (!this.has(ref)) {
                var line = new BundleLine('', ref);
                if (this.head) {
                    var last = this.last();
                    if (last) {
                        last.addAfter(line);
                    } else {
                        this.head.prev = line;
                        line.next = this.head;
                        this.head = line;
                    }
                } else {
                    this.head = line;
                }
            }
        };

        Bundle.prototype.remove = function (ref) {
            ref = path.resolve(this.baseDir, ref);

            var line = this.head;
            while (line) {
                if (line.ref === ref) {
                    if (line === this.head) {
                        this.head = line.next;
                    }
                    line.removeSelf();
                    return;
                }
                line = line.next;
            }
        };

        Bundle.prototype.toArray = function (all) {
            if (typeof all === "undefined") { all = false; }
            var ret = [];
            var base = path.dirname(this.target);
            var line = this.head;
            while (line) {
                if (all || line.ref) {
                    ret.push(line.getRef(base));
                }
                line = line.next;
            }
            return ret;
        };

        Bundle.prototype.first = function (all) {
            if (typeof all === "undefined") { all = false; }
            var line = this.head;
            while (line) {
                if (all || line.ref) {
                    return line;
                }
                line = line.next;
            }
            return null;
        };

        Bundle.prototype.last = function (all) {
            if (typeof all === "undefined") { all = false; }
            var ret = null;
            var line = this.head;
            while (line) {
                if (all || line.ref) {
                    ret = line;
                }
                line = line.next;
            }
            return ret;
        };

        Bundle.prototype.getContent = function () {
            var content = [];

            var base = path.dirname(this.target);
            var line = this.head;
            while (line) {
                content.push(line.getValue(base), this.eol);
                line = line.next;
            }
            return content.join('');
        };
        return Bundle;
    })();
    tsd.Bundle = Bundle;

    var BundleLine = (function () {
        function BundleLine(value, ref) {
            this.value = value;
            this.ref = ref;
        }
        BundleLine.prototype.getRef = function (base) {
            var ref = this.ref;
            if (base) {
                ref = path.relative(base, ref);
            }
            if (path.sep === '\\') {
                ref = ref.replace(/\\/g, '/');
            }
            return ref;
        };

        BundleLine.prototype.getValue = function (base) {
            if (this.ref) {
                return '/// <reference path="' + this.getRef(base) + '" />';
            }
            return this.value;
        };

        BundleLine.prototype.addAfter = function (add) {
            add.prev = this;
            add.next = this.next;
            if (this.next) {
                this.next.prev = add;
            }
            this.next = add;
        };

        BundleLine.prototype.removeSelf = function () {
            if (this.prev) {
                this.prev.next = this.next;
            }
            if (this.next) {
                this.next.prev = this.prev;
            }
            this.next = null;
            this.prev = null;
        };
        return BundleLine;
    })();
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');

    var BundleManager = (function (_super) {
        __extends(BundleManager, _super);
        function BundleManager(core) {
            _super.call(this, core, 'bundle', 'BundleManager');
        }
        BundleManager.prototype.addToBundle = function (target, refs, save) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, BundleManager.bundle_add, target);

            this.readBundle(target, true).then(function (bundle) {
                refs.forEach(function (ref) {
                    bundle.append(ref);
                });
                if (save) {
                    return _this.saveBundle(bundle).progress(d.notify).then(function () {
                        d.resolve(bundle);
                    });
                }
                d.resolve(bundle);
            }).fail(d.reject);

            return d.promise;
        };

        BundleManager.prototype.readBundle = function (target, optional) {
            var d = Q.defer();
            this.track.promise(d.promise, BundleManager.bundle_read, target);

            target = path.resolve(target);

            var bundle = new tsd.Bundle(target, this.core.context.getTypingsDir());

            FS.exists(target).then(function (exists) {
                if (!exists) {
                    if (!optional) {
                        d.reject(new Error('cannot locate file: ' + target));
                    } else {
                        d.resolve(bundle);
                    }
                    return;
                }

                return FS.read(target, { flags: 'rb' }).then(function (buffer) {
                    bundle.parse(buffer.toString('utf8'));
                    d.resolve(bundle);
                });
            }).fail(d.reject);

            return d.promise;
        };

        BundleManager.prototype.saveBundle = function (bundle) {
            var d = Q.defer();

            var target = path.resolve(bundle.target);
            var dir = path.dirname(target);

            this.track.promise(d.promise, BundleManager.bundle_save, target);

            xm.file.mkdirCheckQ(dir, true).then(function () {
                return FS.write(target, bundle.getContent()).then(function () {
                    d.notify(xm.getNote('saved bundle: ' + bundle.target));
                    d.resolve();
                });
            }).fail(d.reject);

            return d.promise;
        };
        BundleManager.bundle_init = 'bundle_init';
        BundleManager.bundle_read = 'bundle_read';
        BundleManager.bundle_save = 'bundle_save';
        BundleManager.bundle_add = 'bundle_add';
        return BundleManager;
    })(tsd.SubCore);
    tsd.BundleManager = BundleManager;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var FS = require('q-io/fs');
    var path = require('path');

    var leadingExp = /^\.\.\//;

    var Core = (function () {
        function Core(context) {
            xm.assertVar(context, tsd.Context, 'context');
            this.context = context;

            this.track = new xm.EventLog('core', 'Core');

            this._components = new tsd.MultiManager(this);
            this._components.add([
                this.index = new tsd.IndexManager(this),
                this.config = new tsd.ConfigIO(this),
                this.selector = new tsd.SelectorQuery(this),
                this.content = new tsd.ContentLoader(this),
                this.parser = new tsd.InfoParser(this),
                this.installer = new tsd.Installer(this),
                this.resolver = new tsd.Resolver(this),
                this.bundle = new tsd.BundleManager(this)
            ]);

            this.updateConfig();

            this.verbose = this.context.verbose;

            xm.object.hidePrefixed(this);
            xm.object.lockProps(this, Object.keys(this), true, false);
        }
        Core.prototype.updateConfig = function () {
            this._components.replace({
                repo: new git.GithubRepo(this.context.config, this.context.paths.cacheDir, this.context.settings)
            });

            this.repo.api.headers['user-agent'] = this.context.packageInfo.getNameVersion();
            this.repo.raw.headers['user-agent'] = this.context.packageInfo.getNameVersion();

            var token = this.context.settings.getValue('/token');
            if (xm.isString(token)) {
                this.repo.api.headers['authorization'] = 'token ' + token;
            } else {
                delete this.repo.api.headers['authorization'];
            }

            this.useCacheMode(this._cacheMode);
        };

        Core.prototype.getInstallPath = function (def) {
            return path.join(this.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
        };

        Core.prototype.useCacheMode = function (modeName) {
            this._cacheMode = modeName;

            if (modeName in xm.http.CacheMode) {
                var mode = xm.http.CacheMode[modeName];
                this.repo.api.cache.opts.applyCacheMode(mode);
                this.repo.raw.cache.opts.applyCacheMode(mode);
            }
        };

        Object.defineProperty(Core.prototype, "verbose", {
            set: function (verbose) {
                this.track.logEnabled = verbose;
                this._components.verbose = verbose;
            },
            enumerable: true,
            configurable: true
        });
        return Core;
    })();
    tsd.Core = Core;

    

    var MultiManager = (function () {
        function MultiManager(core) {
            this.core = core;
            this._verbose = false;
            this.trackables = new Set();
            xm.assertVar(core, tsd.Core, 'core');
        }
        MultiManager.prototype.add = function (list) {
            var _this = this;
            list.forEach(function (comp) {
                _this.trackables.add(comp);
            });
        };

        MultiManager.prototype.remove = function (list) {
            while (list.length > 0) {
                this.trackables.delete(list.pop());
            }
        };

        MultiManager.prototype.replace = function (fields) {
            var _this = this;
            Object.keys(fields).forEach(function (property) {
                _this.trackables.delete(_this.core[property]);
                var trackable = fields[property];
                if (!_this.core[property]) {
                    _this.core[property] = trackable;
                }
                Object.defineProperty(_this.core, property, { value: trackable, writable: false });
                trackable.verbose = _this._verbose;
                _this.trackables.add(fields[property]);
            });
        };

        Object.defineProperty(MultiManager.prototype, "verbose", {
            set: function (verbose) {
                var _this = this;
                this._verbose = verbose;
                this.trackables.forEach(function (comp) {
                    comp.verbose = _this._verbose;
                });
            },
            enumerable: true,
            configurable: true
        });
        return MultiManager;
    })();
    tsd.MultiManager = MultiManager;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');
    var util = require('util');
    var Q = require('q');
    var FS = require('q-io/fs');
    var openInApp = require('open');

    var InstallResult = (function () {
        function InstallResult(options) {
            this.written = new Map();
            this.removed = new Map();
            this.skipped = new Map();
            xm.assertVar(options, tsd.Options, 'options');
            this.options = options;
        }
        return InstallResult;
    })();
    tsd.InstallResult = InstallResult;

    var CompareResult = (function () {
        function CompareResult() {
        }
        return CompareResult;
    })();
    tsd.CompareResult = CompareResult;

    var API = (function () {
        function API(context) {
            this.context = context;
            xm.assertVar(context, tsd.Context, 'context');

            this.core = new tsd.Core(this.context);
            this.track = new xm.EventLog('api', 'API');
            this.track.unmuteActions([xm.EventLevel.notify]);

            xm.object.lockProps(this, ['core', 'track']);

            this.verbose = this.context.verbose;
        }
        API.prototype.initConfig = function (overwrite) {
            var p = this.core.config.initConfig(overwrite);
            this.track.promise(p, 'config_init');
            return p;
        };

        API.prototype.readConfig = function (optional) {
            var p = this.core.config.readConfig(optional);
            this.track.promise(p, 'config_read');
            return p;
        };

        API.prototype.saveConfig = function () {
            var p = this.core.config.saveConfig();
            this.track.promise(p, 'config_save');
            return p;
        };

        API.prototype.select = function (query, options) {
            xm.assertVar(query, tsd.Query, 'query');
            xm.assertVar(options, tsd.Options, 'options', true);
            options = options || tsd.Options.main;

            var p = this.core.selector.select(query, options);
            this.track.promise(p, 'select');
            return p;
        };

        API.prototype.install = function (selection, options) {
            var _this = this;
            xm.assertVar(selection, tsd.Selection, 'selection');
            xm.assertVar(options, tsd.Options, 'options', true);
            options = options || tsd.Options.main;

            var d = Q.defer();
            this.track.promise(d.promise, 'install');

            var res = new tsd.InstallResult(options);
            var files = tsd.DefUtil.mergeDependencies(selection.selection);

            this.core.installer.installFileBulk(files, options.saveToConfig, options.overwriteFiles).progress(d.notify).then(function (written) {
                if (!written) {
                    throw new Error('expected install paths');
                }
                res.written = written;
            }).then(function () {
                if (options.saveToConfig) {
                    return _this.core.config.saveConfig().progress(d.notify);
                }
                return null;
            }).then(function () {
                return _this.saveBundles(xm.valuesOf(res.written), options).progress(d.notify);
            }).then(function () {
                d.resolve(res);
            }, d.reject);

            return d.promise;
        };

        API.prototype.saveBundles = function (files, options) {
            var _this = this;
            xm.assertVar(files, 'array', 'files');
            xm.assertVar(options, tsd.Options, 'options', true);
            options = options || tsd.Options.main;

            var d = Q.defer();
            this.track.promise(d.promise, 'bundle_save');

            var bundles = [];
            if (options.addToBundles) {
                options.addToBundles.forEach(function (bundle) {
                    bundle = path.join(_this.context.config.path, bundle);
                    if (!/\.ts$/.test(bundle)) {
                        bundle += '.d.ts';
                    }
                    bundles.push(bundle);
                });
            }
            var refs = [];
            files.forEach(function (file) {
                refs.push(file.def.path);
            });

            Q.all(bundles.map(function (target) {
                return _this.core.bundle.addToBundle(target, refs, true).progress(d.notify);
            })).then(function () {
                if (options.saveToConfig && _this.context.config.bundle) {
                    return _this.core.bundle.addToBundle(_this.context.config.bundle, refs, true);
                }
            }).then(function () {
                d.resolve();
            }, d.reject);

            return d.promise;
        };

        API.prototype.reinstall = function (options) {
            var _this = this;
            var d = Q.defer();
            this.track.promise(d.promise, 'reinstall');

            var res = new tsd.InstallResult(options);

            this.core.installer.reinstallBulk(this.context.config.getInstalled(), options.overwriteFiles).progress(d.notify).then(function (map) {
                res.written = map;
            }).then(function () {
                if (options.saveToConfig) {
                    return _this.core.config.saveConfig().progress(d.notify);
                }
                return null;
            }).then(function () {
                return _this.saveBundles(xm.valuesOf(res.written), options).progress(d.notify);
            }).then(function () {
                d.resolve(res);
            }, d.reject);

            return d.promise;
        };

        API.prototype.update = function (options, version) {
            var _this = this;
            if (typeof version === "undefined") { version = 'latest'; }
            var d = Q.defer();
            this.track.promise(d.promise, 'update');

            var query = new tsd.Query();
            this.context.config.getInstalled().forEach(function (inst) {
                query.addNamePattern(tsd.Def.getFrom(inst.path).pathTerm);
            });
            query.versionMatcher = new tsd.VersionMatcher(version);

            this.select(query, options).progress(d.notify).then(function (selection) {
                return _this.install(selection, options).progress(d.notify).then(function (res) {
                    d.resolve(res);
                });
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.getRateInfo = function () {
            var p = this.core.repo.api.getRateInfo();
            this.track.promise(p, 'rate_info');
            return p;
        };

        API.prototype.compare = function (query) {
            xm.assertVar(query, tsd.Query, 'query');
            var d = Q.defer();
            this.track.promise(d.promise, 'compare');
            d.reject(new Error('not implemented yet'));

            return d.promise;
        };

        API.prototype.browse = function (list) {
            var _this = this;
            xm.assertVar(list, 'array', 'list');

            var d = Q.defer();
            this.track.promise(d.promise, 'browse');
            if (list.length > 2) {
                d.reject(new Error('to many results to open in browser'));
                return d.promise;
            }

            var opened = [];

            list.forEach(function (file) {
                var ref = file.commit.commitSha;

                if (file.commit.commitSha === file.def.head.commit.commitSha) {
                    ref = _this.core.context.config.ref;
                }
                var url = _this.core.repo.urls.htmlFile(ref, file.def.path);
                opened.push(url);
                openInApp(url);
            });
            d.resolve(opened);

            return d.promise;
        };

        API.prototype.visit = function (list) {
            var _this = this;
            xm.assertVar(list, 'array', 'list');

            var d = Q.defer();
            this.track.promise(d.promise, 'visit');
            if (list.length > 2) {
                d.reject(new Error('to many results to open in browser'));
                return d.promise;
            }

            var opened = [];

            Q.all(list.map(function (file) {
                if (!file.info) {
                    return _this.core.parser.parseDefInfo(file).progress(d.notify);
                }
                return Q(file);
            })).then(function () {
                list.forEach(function (file) {
                    var url;
                    if (file.info && file.info.projectUrl) {
                        url = file.info.projectUrl;
                    } else if (file.def.head.info && file.def.head.info.projectUrl) {
                        url = file.def.head.info.projectUrl;
                    }
                    if (url) {
                        opened.push(url);
                        openInApp(url);
                    }
                });
                d.resolve(opened);
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.purge = function (raw, api) {
            var d = Q.defer();
            this.track.promise(d.promise, 'purge');
            var queue = [];

            if (raw) {
                queue.push(this.core.repo.raw.cache.cleanupCacheAge(0).progress(d.notify));
            }
            if (api) {
                queue.push(this.core.repo.api.cache.cleanupCacheAge(0).progress(d.notify));
            }

            if (queue.length > 0) {
                Q.all(queue).done(function () {
                    d.resolve();
                }, d.reject);
            } else {
                d.resolve();
            }

            return d.promise;
        };

        Object.defineProperty(API.prototype, "verbose", {
            set: function (verbose) {
                this.track.logEnabled = verbose;
                this.core.verbose = verbose;
            },
            enumerable: true,
            configurable: true
        });
        return API;
    })();
    tsd.API = API;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';
    var jsesc = require('jsesc');

    xm.parseStringMap = Object.create(null);

    var splitSV = /[\t ]*[,][\t ]*/g;

    xm.parseStringMap.number = function (input) {
        var num = parseFloat(input);
        if (isNaN(num)) {
            throw new Error('input is NaN and not float');
        }
        return num;
    };
    xm.parseStringMap.int = function (input) {
        var num = parseInt(input, 10);
        if (isNaN(num)) {
            throw new Error('input is NaN and not integer');
        }
        return num;
    };
    xm.parseStringMap.string = function (input) {
        return String(input);
    };
    xm.parseStringMap.boolean = function (input) {
        input = ('' + input).toLowerCase();
        if (input === '' || input === '0') {
            return false;
        }
        switch (input) {
            case 'false':
            case 'null':
            case 'nan':
            case 'undefined':

            case 'no':
            case 'off':
            case 'disabled':
                return false;
        }
        return true;
    };
    xm.parseStringMap.flag = function (input) {
        if (xm.isUndefined(input) || input === '') {
            return true;
        }
        return xm.parseStringMap.boolean(input);
    };
    xm.parseStringMap['number[]'] = function (input) {
        if (!xm.isString(input)) {
            return [];
        }
        return input.split(splitSV).map(function (value) {
            return xm.parseStringMap.number(value);
        });
    };
    xm.parseStringMap['int[]'] = function (input) {
        if (!xm.isString(input)) {
            return [];
        }
        return input.split(splitSV).map(function (value) {
            return xm.parseStringMap.int(value);
        });
    };
    xm.parseStringMap['string[]'] = function (input) {
        if (!xm.isString(input)) {
            return [];
        }
        return input.split(splitSV);
    };
    xm.parseStringMap.json = function (input) {
        if (!xm.isString(input)) {
            return null;
        }
        return JSON.parse(input);
    };

    function parseStringTo(input, type) {
        if (xm.hasOwnProp(xm.parseStringMap, type)) {
            return xm.parseStringMap[type](input);
        }

        return String(input);
    }
    xm.parseStringTo = parseStringTo;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var jsesc = require('jsesc');
    var ministyle = require('ministyle');
    var miniwrite = require('miniwrite');
    var minitable = require('minitable');

    function exposeSortIndex(one, two) {
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortIndex = exposeSortIndex;

    function exposeSortHasElem(one, two, elem) {
        var oneI = one.indexOf(elem) > -1;
        var twoI = two.indexOf(elem) > -1;
        if (oneI && !twoI) {
            return -1;
        } else if (!oneI && twoI) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortHasElem = exposeSortHasElem;

    function exposeSortId(one, two) {
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortId = exposeSortId;

    function exposeSortGroup(one, two) {
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortGroup = exposeSortGroup;

    function exposeSortOption(one, two) {
        if (one.short && !two.short) {
            return -1;
        }
        if (!one.short && two.short) {
            return 1;
        }
        if (one.short && two.short) {
            if (one.short.toLowerCase() < two.short.toLowerCase()) {
                return -1;
            } else if (one.short.toLowerCase() > two.short.toLowerCase()) {
                return 1;
            }
        }
        if (one.name.toLowerCase() < two.name.toLowerCase()) {
            return -1;
        } else if (one.name.toLowerCase() > two.name.toLowerCase()) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortOption = exposeSortOption;

    var ExposeLevel = (function () {
        function ExposeLevel() {
        }
        ExposeLevel.min = -1;
        ExposeLevel.med = 0;
        ExposeLevel.max = 1;
        return ExposeLevel;
    })();
    xm.ExposeLevel = ExposeLevel;

    var ExposeReporter = (function () {
        function ExposeReporter(expose, output) {
            if (typeof output === "undefined") { output = null; }
            xm.assertVar(expose, xm.Expose, 'expose');
            xm.assertVar(output, xm.StyledOut, 'output', true);
            this.expose = expose;
            this.output = (output || new xm.StyledOut());
        }
        ExposeReporter.prototype.printCommands = function (level) {
            var _this = this;
            var builder = minitable.getBuilder(this.output.getWrite(), this.output.getStyle());
            xm.assertVar(builder, 'object', 'builder');

            var headers = builder.createType('headers', [
                { name: 'title' }
            ]);
            var divider = builder.createType('divider', [
                { name: 'main' }
            ]);
            var commands = builder.createType('commands', [
                { name: 'command' },
                { name: 'short' },
                { name: 'label' }
            ], {
                inner: '   ',
                rowSpace: 0
            });
            var lines = builder.createType('line', [
                { name: 'label' }
            ], {
                rowSpace: 0
            });
            var examples = builder.createType('examples', [
                { name: 'command' },
                { name: 'label' }
            ], {
                inner: '   '
            });

            headers.init();
            divider.init();
            commands.init();
            lines.init();
            examples.init();

            var commandOptNames = [];
            var globalOptNames = [];
            var detailPad = this.output.nibs.decl;

            var allCommands = xm.keysOf(this.expose.commands);
            var allGroups = xm.valuesOf(this.expose.groups);

            var sortOptionName = function (one, two) {
                return exposeSortOption(_this.expose.options.get(one), _this.expose.options.get(two));
            };

            var optKeys = xm.keysOf(this.expose.options).sort(sortOptionName);

            var firstHeader = true;
            var addHeader = function (title) {
                if (!firstHeader) {
                    addDivider();
                }
                builder.closeAll();
                firstHeader = false;
                headers.next();
                headers.row.title.out.accent('>> ').plain(title).line();
                addDivider();
            };

            var addDivider = function () {
                builder.closeAll();
                divider.next();
                divider.row.main.out.line('   ');
            };

            var addOption = function (name) {
                commands.next();
                var option = _this.expose.options.get(name);
                var command = commands.row.command.out;
                var label = commands.row.label.out;
                if (!option) {
                    command.indent(1).sp().accent('--').plain(name).ln();
                    label.indent(1).warning('<undefined>').ln();
                } else {
                    command.indent(1).sp().accent('--').plain(name);
                    if (option.placeholder) {
                        command.sp().muted('<').plain(option.placeholder).muted('>');
                    }
                    command.ln();

                    if (option.short) {
                        commands.row.short.out.accent('-').line(option.short);
                    }

                    label.accent(' > ').plain(option.description);
                    label.sp().accent('(').plain(option.type);
                    label.plain((option.default ? ', default: ' + option.default : ''));
                    label.accent(')').ln();

                    if (option.enum.length > 0) {
                        label.indent().accent(' [ ').plain(option.enum.map(function (value) {
                            if (xm.isNumber(value)) {
                                return value;
                            }
                            var str = ('' + value);
                            if (/^[\w_-]*$/.test(str)) {
                                return str;
                            }
                            return '\'' + jsesc(('' + value), {
                                quotes: 'single'
                            }) + '\'';
                        }).join(', ')).accent(' ]').ln();
                    }
                }

                addNote(option.note);
            };

            var addCommand = function (cmd, group) {
                if (cmd.hidden) {
                    return;
                }
                commands.next();
                var command = commands.row.command.out;
                command.indent(1).plain(cmd.name);
                if (cmd.variadic.length > 0) {
                    command.sp().muted('<').plain(cmd.variadic.join(', ')).muted('>');
                }
                command.ln();

                commands.row.label.out.line(cmd.label);

                addNote(cmd.note);
                addExamples(cmd.examples);

                cmd.options.filter(function (name) {
                    return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
                }).sort(sortOptionName).forEach(function (name) {
                    addOption(name);
                });
            };

            var addNote = function (note) {
                if (note && note.length > 0) {
                    note.forEach(function (note) {
                        commands.row.label.out.indent().accent(' : ').line(String(note));
                    });
                }
            };

            var addExamples = function (list) {
                if (list && list.length > 0) {
                    builder.closeAll();
                    lines.next();
                    lines.row.label.out.line();
                    lines.close();

                    list.forEach(function (cols) {
                        if (cols.length === 1) {
                            lines.next();
                            lines.row.label.out.indent().line(String(cols[0]));
                        } else if (cols.length > 1) {
                            examples.next();
                            examples.row.command.out.indent(2).accent(' $ ').line(String(cols[0]));
                            examples.row.label.out.accent(' : ').line(String(cols[1]));
                        }
                    });
                    examples.close();

                    lines.next();
                    lines.row.label.out.line();
                }
            };

            optKeys.forEach(function (name) {
                var option = _this.expose.options.get(name);
                if (option.command) {
                    commandOptNames.push(option.name);
                }
            });

            optKeys.forEach(function (name) {
                var option = _this.expose.options.get(name);
                if (option.global && !option.command) {
                    globalOptNames.push(option.name);
                }
            });

            if (allGroups.length > 0) {
                xm.valuesOf(this.expose.groups).sort(exposeSortGroup).forEach(function (group) {
                    var contents = xm.valuesOf(_this.expose.commands).filter(function (cmd) {
                        return cmd.groups.indexOf(group.name) > -1;
                    });
                    if (contents.length > 0) {
                        addHeader(group.label);
                        contents.sort(group.sorter).forEach(function (cmd) {
                            addCommand(cmd, group);

                            var i = allCommands.indexOf(cmd.name);
                            if (i > -1) {
                                allCommands.splice(i, 1);
                            }
                        });

                        if (group.options.length > 0) {
                            group.options.filter(function (name) {
                                return (commandOptNames.indexOf(name) < 0) && (globalOptNames.indexOf(name) < 0);
                            }).sort(sortOptionName).forEach(function (name) {
                                addOption(name);
                            });
                        }
                    }
                });
            }

            if (allCommands.length > 0) {
                addHeader('other commands');

                allCommands.forEach(function (name) {
                    addCommand(_this.expose.commands.get(name), _this.expose.mainGroup);
                });
            }

            if (commandOptNames.length > 0 && globalOptNames.length > 0) {
                addHeader('global options');

                if (commandOptNames.length > 0) {
                    commandOptNames.forEach(function (name) {
                        addOption(name);
                    });
                }

                if (globalOptNames.length > 0) {
                    globalOptNames.forEach(function (name) {
                        addOption(name);
                    });
                }
            }
            builder.flush();
        };
        return ExposeReporter;
    })();
    xm.ExposeReporter = ExposeReporter;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');

    var ExposeContext = (function () {
        function ExposeContext(expose, argv, command) {
            this.expose = expose;
            this.command = command;
            this.argv = argv;

            this.out = this.expose.reporter.output;
        }
        ExposeContext.prototype.hasOpt = function (name, strict) {
            if (typeof strict === "undefined") { strict = false; }
            if (xm.hasOwnProp(this.argv, name)) {
                if (strict && !this.expose.options.has(name)) {
                    return false;
                }
                return true;
            }
            return false;
        };

        ExposeContext.prototype.getOptRaw = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                return this.argv[name];
            }
            return alt;
        };

        ExposeContext.prototype.getOpt = function (name, alt) {
            if (this.hasOpt(name)) {
                var option = this.expose.options.get(name);
                if (option && option.type) {
                    try  {
                        return xm.parseStringTo(this.argv[name], option.type);
                    } catch (e) {
                    }
                } else {
                    return this.argv[name];
                }
            }
            return this.getDefault(name, alt);
        };

        ExposeContext.prototype.getOptAs = function (name, type, alt) {
            if (this.hasOpt(name)) {
                return xm.parseStringTo(this.argv[name], type);
            }
            return this.getDefault(name, alt);
        };

        ExposeContext.prototype.getOptNames = function (strict) {
            var _this = this;
            if (typeof strict === "undefined") { strict = false; }
            return Object.keys(this.argv).filter(function (name) {
                return (name !== '_' && _this.hasOpt(name, strict));
            });
        };

        ExposeContext.prototype.getOptEnum = function (name, alt) {
            if (this.hasOpt(name)) {
                if (this.expose.options.has(name)) {
                    var option = this.expose.options.get(name);
                    var value = this.getOpt(name);
                    if (option.enum && option.enum.indexOf(value) > -1) {
                        return value;
                    }
                }
            }
            return alt;
        };

        ExposeContext.prototype.getDefault = function (name, alt) {
            var option = this.expose.options.get(name);
            if (option && !xm.isUndefined(option.default)) {
                return option.default;
            }
            return alt;
        };

        ExposeContext.prototype.isDefault = function (name) {
            if (this.hasOpt(name, true)) {
                var def = this.expose.options.get(name).default;
                if (!xm.isUndefined(def)) {
                    return (def === this.getOpt(name));
                }
            }
            return false;
        };

        ExposeContext.prototype.getArgAt = function (index, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return this.argv._[index];
            }
            return alt;
        };

        ExposeContext.prototype.getArgAtAs = function (index, type, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return xm.parseStringTo(this.argv._[index], type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgsAs = function (type) {
            return this.argv._.map(function (value) {
                return xm.parseStringTo(value, type);
            });
        };

        ExposeContext.prototype.shiftArg = function (alt) {
            if (this.argv._.length > 0) {
                return this.argv._.shift();
            }
            return alt;
        };

        ExposeContext.prototype.shiftArgAs = function (type, alt) {
            if (this.argv._.length > 0) {
                return xm.parseStringTo(this.argv._.shift(), type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgs = function (alt) {
            if (this.argv._.length > 0) {
                return this.argv._.shift();
            }
            return alt;
        };

        Object.defineProperty(ExposeContext.prototype, "numArgs", {
            get: function () {
                return this.argv._.length;
            },
            enumerable: true,
            configurable: true
        });
        return ExposeContext;
    })();
    xm.ExposeContext = ExposeContext;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var minimist = require('minimist');
    var jsesc = require('jsesc');
    var Q = require('q');

    var exitProcess = require('exit');

    

    var ExposeCommand = (function () {
        function ExposeCommand() {
            this.options = [];
            this.variadic = [];
            this.groups = [];
            this.examples = [];
            this.note = [];
        }
        return ExposeCommand;
    })();
    xm.ExposeCommand = ExposeCommand;

    var ExposeGroup = (function () {
        function ExposeGroup() {
            this.sorter = xm.exposeSortIndex;
            this.options = [];
        }
        return ExposeGroup;
    })();
    xm.ExposeGroup = ExposeGroup;

    var ExposeOption = (function () {
        function ExposeOption() {
            this.global = false;
            this.optional = true;
            this.enum = [];
            this.note = [];
        }
        return ExposeOption;
    })();
    xm.ExposeOption = ExposeOption;

    var Expose = (function () {
        function Expose(output) {
            if (typeof output === "undefined") { output = null; }
            this.commands = new Map();
            this.options = new Map();
            this.groups = new Map();
            this.mainGroup = new ExposeGroup();
            this._isInit = false;
            this._index = 0;
            this.reporter = new xm.ExposeReporter(this, output);

            xm.object.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
                writable: false,
                enumerable: false
            });
        }
        Expose.prototype.defineOption = function (build) {
            var opt = new ExposeOption();
            build(opt);

            if (opt.type === 'flag' && xm.isUndefined(opt.default)) {
                opt.default = false;
            }

            xm.assertVar(opt.name, 'string', 'opt.name');

            if (this.options.has(opt.name)) {
                throw new Error('opt.name collision on ' + opt.name);
            }
            this.options.set(opt.name, opt);
        };

        Expose.prototype.defineCommand = function (build) {
            var cmd = new ExposeCommand();
            build(cmd);
            cmd.index = (++this._index);

            xm.assertVar(cmd.name, 'string', 'build.name');

            if (this.commands.has(cmd.name)) {
                throw new Error('cmd.name collision on ' + cmd.name);
            }
            this.commands.set(cmd.name, cmd);
        };

        Expose.prototype.defineGroup = function (build) {
            var group = new ExposeGroup();
            build(group);
            group.index = (++this._index);

            xm.assertVar(group.name, 'string', 'group.name');

            if (this.groups.has(group.name)) {
                throw new Error('group.name collision on ' + group.name);
            }
            this.groups.set(group.name, group);
        };

        Expose.prototype.applyOptions = function (argv) {
            var _this = this;
            var opts = {
                string: [],
                boolean: [],
                alias: {},
                default: {}
            };

            this.options.forEach(function (option) {
                if (option.short) {
                    opts.alias[option.name] = option.short;
                }
                if (option.default) {
                    opts.default[option.name] = option.default;
                }

                if (option.type !== 'number') {
                    opts.string.push(option.name);
                }
            });

            argv = minimist(argv, opts);
            var ctx = new xm.ExposeContext(this, argv, null);

            ctx.getOptNames(true).forEach(function (name) {
                var opt = _this.options.get(name);
                if (opt.apply) {
                    opt.apply(ctx.getOpt(name), ctx);
                }
            });
            return ctx;
        };

        Expose.prototype.init = function () {
            var _this = this;
            if (this._isInit) {
                return;
            }
            this._isInit = true;

            this.groups.forEach(function (group) {
                _this.validateOptions(group.options);
            });

            this.commands.forEach(function (cmd) {
                _this.validateOptions(cmd.options);
            });
        };

        Expose.prototype.validateOptions = function (opts) {
            var _this = this;
            opts.forEach(function (name) {
                xm.assert(_this.options.has(name), 'undefined option {a}', name);
            });
        };

        Expose.prototype.exit = function (code) {
            if (code !== 0) {
                this.reporter.output.ln().error('Closing with exit code ' + code).clear();

                exitProcess(code);
            } else {
            }
        };

        Expose.prototype.executeArgv = function (argvRaw, alt, exitAfter) {
            var _this = this;
            if (typeof exitAfter === "undefined") { exitAfter = true; }
            Q(this.executeRaw(argvRaw, alt)).then(function (res) {
                if (_this.end) {
                    return Q(_this.end.call(null, res)).then(function (over) {
                        return over || res;
                    });
                }
                return res;
            }).then(function (res) {
                if (res.error) {
                    throw (res.error);
                }
                if (exitAfter) {
                    _this.exit(res.code);
                }
            }).fail(function (err) {
                if (err.stack) {
                    _this.reporter.output.span(err.stack).clear();
                } else {
                    _this.reporter.output.error(err.toString()).clear();
                }
                _this.exit(1);
            });
        };

        Expose.prototype.executeRaw = function (argvRaw, alt) {
            this.init();

            if (!alt || !this.commands.has(alt)) {
                alt = 'help';
            }

            var options = xm.valuesOf(this.options);
            var opt;
            var i, ii;

            var ctx = this.applyOptions(argvRaw);
            if (!ctx) {
                return this.executeCommand(alt);
            }

            for (i = 0, ii = options.length; i < ii; i++) {
                opt = options[i];
                if (opt.command && ctx.hasOpt(opt.name, true)) {
                    return this.executeCommand(opt.command, ctx);
                }
            }

            var cmd = ctx.shiftArg();

            cmd = ctx.shiftArg();
            if (ctx.numArgs === 0) {
                return this.executeCommand(alt, ctx);
            }

            cmd = ctx.shiftArg();
            if (this.commands.has(cmd)) {
                return this.executeCommand(cmd, ctx);
            } else {
                this.reporter.output.ln().warning('command not found: ' + cmd).clear();
                return this.executeCommand('help', ctx);
            }
        };

        Expose.prototype.executeCommand = function (name, ctx) {
            var _this = this;
            if (typeof ctx === "undefined") { ctx = null; }
            this.init();

            if (!this.commands.has(name)) {
                return Q({
                    code: 1,
                    error: new Error('unknown command ' + name)
                });
            }
            var cmd = this.commands.get(name);

            var defer = Q.defer();

            Q.resolve().then(function () {
                if (_this.before) {
                    return Q(_this.before(ctx));
                }
                return null;
            }).then(function () {
                return Q(cmd.execute(ctx));
            }).then(function () {
                if (_this.after) {
                    return Q(_this.after(ctx));
                }
                return null;
            }).then(function () {
                return {
                    code: 0,
                    ctx: ctx
                };
            }, function (err) {
                xm.log.error('err', err);
                return {
                    code: (err.code && err.code !== 0 ? err.code : 1),
                    error: err,
                    ctx: ctx
                };
            }).done(function (ret) {
                defer.resolve(ret);
            });

            return defer.promise;
        };
        return Expose;
    })();
    xm.Expose = Expose;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    (function (cli) {
        var lineSplitExp = /[ \t]*[\r\n][ \t]*/g;

        var Printer = (function () {
            function Printer(output, indent) {
                if (typeof indent === "undefined") { indent = 0; }
                this.indent = 0;
                this.skipProgress = [
                    /^(?:\w+: )?written zero \w+ bytes/,
                    /^(?:\w+: )?missing \w+ file/,
                    /^(?:\w+: )?remote:/,
                    /^(?:\w+: )?dropped from cache:/,
                    /^(?:\w+: )?local:/,
                    /^(?:\w+: )?update:/
                ];
                this._remainingPrev = -1;
                this.output = output;
                this.indent = indent;

                this.reportProgress = this.reportProgress.bind(this);
            }
            Printer.prototype.fmtSortKey = function (key) {
                return String(key).substr(0, 6);
            };

            Printer.prototype.fmtGitURI = function (str) {
                var _this = this;
                return String(str).replace(/https:\/\/[a-z]+\.github\.com\/(?:repos\/)?/g, '').replace(/([0-9a-f]{40})/g, function (match, p1) {
                    return _this.fmtSortKey(p1);
                });
            };

            Printer.prototype.file = function (file, sep) {
                if (typeof sep === "undefined") { sep = ' : '; }
                if (file.def) {
                    this.output.tweakPath(file.def.path);
                } else {
                    this.output.accent('<no def>');
                }
                return this.output.accent(sep).glue(this.fileEnd(file, sep));
            };

            Printer.prototype.fileEnd = function (file, sep) {
                if (typeof sep === "undefined") { sep = ' | '; }
                if (file.def && file.def.head === file) {
                    this.output.span('<head>');
                    if (file.commit.changeDate) {
                        this.output.accent(sep).span(xm.date.toNiceUTC(file.commit.changeDate));
                    }
                } else {
                    if (file.commit) {
                        this.output.span(file.commit.commitShort);
                        if (file.commit.changeDate) {
                            this.output.accent(sep).span(xm.date.toNiceUTC(file.commit.changeDate));
                        }
                    } else {
                        this.output.accent(sep).accent('<no commit>');
                    }
                }

                return this.output;
            };

            Printer.prototype.fileCommit = function (file, skipNull) {
                var _this = this;
                if (typeof skipNull === "undefined") { skipNull = false; }
                var sep = '  |  ';
                if (file.commit) {
                    this.output.indent(1).glue(this.fileEnd(file, sep));
                    this.output.accent(sep).span(file.commit.gitAuthor.name);
                    if (file.commit.hubAuthor) {
                        this.output.accent('  @  ').span(file.commit.hubAuthor.login);
                    }
                    this.output.ln().ln();

                    this.output.indent(1).edge(true).line(file.commit.message.subject);

                    if (file.commit.message.body) {
                        this.output.indent(1).edge(true).ln();

                        file.commit.message.body.split(lineSplitExp).every(function (line, index, lines) {
                            _this.output.indent(1).edge(true).line(line);
                            if (index < 10) {
                                return true;
                            }
                            _this.output.indent(1).edge(true).line('<...>');
                            return false;
                        });
                    }
                } else if (!skipNull) {
                    this.output.indent(1).accent('<no commmit>').ln();
                }
                return this.output;
            };

            Printer.prototype.fileHead = function (file) {
                return this.output.indent(0).bullet(true).glue(this.file(file)).ln();
            };

            Printer.prototype.fileInfo = function (file, skipNull) {
                var _this = this;
                if (typeof skipNull === "undefined") { skipNull = false; }
                if (file.info) {
                    this.output.line();
                    if (file.info.isValid()) {
                        this.output.indent(1).tweakPunc(file.info.toString());
                        if (file.info.projectUrl) {
                            this.output.space().tweakURI(file.info.projectUrl, true, true);
                        }
                        this.output.ln();

                        if (file.info.authors) {
                            this.output.ln();
                            file.info.authors.forEach(function (author) {
                                _this.output.indent(1).bullet(true).span(author.name);
                                if (author.url) {
                                    _this.output.space().tweakURI(author.url, true, true);
                                }
                                _this.output.ln();
                            });
                        }
                    } else {
                        this.output.indent(1).accent('<invalid info>').line();
                    }
                } else if (!skipNull) {
                    this.output.line();
                    this.output.indent(1).accent('<no info>').line();
                }
                return this.output;
            };

            Printer.prototype.dependencies = function (file) {
                var _this = this;
                if (file.dependencies.length > 0) {
                    this.output.line();
                    var deps = tsd.DefUtil.mergeDependenciesOf(file.dependencies).filter(function (refer) {
                        return refer.def.path !== file.def.path;
                    });
                    if (deps.length > 0) {
                        deps.filter(function (refer) {
                            return refer.def.path !== file.def.path;
                        }).sort(tsd.DefUtil.fileCompare).forEach(function (refer) {
                            _this.output.indent(1).report(true).glue(_this.file(refer)).ln();
                        });
                    }
                }
                return this.output;
            };

            Printer.prototype.history = function (file) {
                var _this = this;
                if (file.def.history.length > 0) {
                    this.output.line();
                    file.def.history.slice(0).reverse().forEach(function (file, i) {
                        _this.fileCommit(file);
                        _this.output.cond(i < file.def.history.length - 1, '\n');
                    });
                }
                return this.output;
            };

            Printer.prototype.installResult = function (result) {
                var _this = this;
                var keys = xm.keysOf(result.written);
                if (keys.length === 0) {
                    this.output.ln().report(true).span('written ').accent('zero').span(' files').ln();
                } else if (keys.length === 1) {
                    this.output.ln().report(true).span('written ').accent(keys.length).span(' file:').ln().ln();
                } else {
                    this.output.ln().report(true).span('written ').accent(keys.length).span(' files:').ln().ln();
                }

                keys.sort().forEach(function (path) {
                    _this.output.indent().bullet(true);
                    var file = result.written.get(path);
                    if (file.def) {
                        _this.output.tweakPath(file.def.path);
                    } else {
                        _this.output.accent('<no def>');
                    }
                    _this.output.ln();
                });

                return this.output;
            };

            Printer.prototype.rateInfo = function (info, note, force) {
                if (typeof note === "undefined") { note = false; }
                if (typeof force === "undefined") { force = false; }
                var warnLim = 10;
                var goodLim = 30;
                var stealthLim = 45;

                if (info.remaining === this._remainingPrev && !force) {
                    return this.output;
                }
                this._remainingPrev = info.remaining;
                if (info.remaining === info.limit && !force) {
                    return this.output;
                }
                if (info.remaining > stealthLim && !force) {
                    return this.output;
                }

                if (note) {
                    this.output.indent(1);
                } else {
                    this.output.line();
                }
                this.output.note(true).span('rate-limit').sp();

                if (info.limit > 0) {
                    if (info.remaining === 0) {
                        this.output.error(info.remaining).span(' / ').error(info.limit).span(' -> ').error(info.getResetString());
                    } else if (info.remaining <= warnLim) {
                        this.output.warning(info.remaining).span(' / ').warning(info.limit).span(' -> ').warning(info.getResetString());
                    } else if (info.remaining <= goodLim) {
                        this.output.success(info.remaining).span(' / ').success(info.limit).span(' -> ').success(info.getResetString());
                    } else {
                        this.output.accent(info.remaining).span(' / ').accent(info.limit);
                        if (force) {
                            this.output.span(' -> ').success(info.getResetString());
                        }
                    }
                } else {
                    this.output.success(info.getResetString());
                }
                return this.output.ln();
            };

            Printer.prototype.reportError = function (err, head) {
                if (typeof head === "undefined") { head = true; }
                if (head) {
                    this.output.ln().info().error('an error occured!').clear();
                }

                if (err.stack) {
                    return this.output.block(err.stack);
                }
                return this.output.line(err);
            };

            Printer.prototype.reportProgress = function (obj) {
                var _this = this;
                if (obj instanceof git.GitRateInfo) {
                    return this.rateInfo(obj, true);
                }
                if (xm.isObject(obj)) {
                    if (obj.data instanceof git.GitRateInfo) {
                        return this.rateInfo(obj.data, true);
                    }

                    if (obj.message) {
                        if (this.skipProgress.some(function (exp) {
                            return exp.test(obj.message);
                        })) {
                            return this.output;
                        }
                    }

                    this.output.indent().note(true);

                    if (xm.isValid(obj.code)) {
                        this.output.label(obj.code);
                    }
                    if (obj.message) {
                        var msg = this.fmtGitURI(String(obj.message));
                        msg = msg.replace(/([\w\\\/])(: )([\w\\\/\.-])/g, function (match, p1, p2, p3) {
                            return p1 + _this.output.getStyle().accent(p2) + p3;
                        });
                        msg = msg.replace(' -> ', this.output.getStyle().accent(' -> '));
                        this.output.write(msg);
                    } else {
                        this.output.span('<no message>');
                    }
                    if (obj.data) {
                        this.output.sp().inspect(obj, 3);
                    } else {
                        this.output.ln();
                    }

                    return this.output;
                } else {
                    return this.output.indent().note(true).span(String(obj)).ln();
                }
                return this.output.indent().note(true).label(xm.typeOf(obj)).inspect(obj, 3);
            };
            return Printer;
        })();
        cli.Printer = Printer;
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    (function (cli) {
        var path = require('path');
        var Q = require('q');

        var updateNotifier = require('update-notifier');

        var notifier;

        function runUpdateNotifier(context, promise) {
            if (typeof promise === "undefined") { promise = false; }
            var opts = context.settings.getChild('update-notifier');

            return Q.resolve().then(function () {
                var defer = Q.defer();
                if (notifier || !opts.getBoolean('enabled', true)) {
                    return Q.resolve(notifier);
                }

                var callback = (promise ? function (err, update) {
                    if (err) {
                        notifier = null;
                        defer.reject(err);
                    } else {
                        notifier.update = update;
                        defer.resolve(notifier);
                    }
                } : undefined);

                var settings = {
                    packageName: context.packageInfo.name,
                    packageVersion: context.packageInfo.version,
                    updateCheckInterval: opts.getDurationSecs('updateCheckInterval', 24 * 3600) * 1000,
                    updateCheckTimeout: opts.getDurationSecs('updateCheckTimeout', 10) * 1000,
                    registryUrl: opts.getString('registryUrl'),
                    callback: callback
                };

                notifier = updateNotifier(settings);
                if (!callback) {
                    defer.resolve(notifier);
                }
                return defer.promise;
            });
        }
        cli.runUpdateNotifier = runUpdateNotifier;

        function showUpdateNotifier(output, context, promise) {
            if (typeof promise === "undefined") { promise = false; }
            return Q.resolve().then(function () {
                if (context) {
                    return runUpdateNotifier(context, promise);
                }
                return notifier;
            }).then(function (notifier) {
                if (notifier && notifier.update) {
                    output.ln();
                    output.report(true).span('update available: ');
                    output.tweakPunc(notifier.update.current).accent(' -> ').tweakPunc(notifier.update.latest);
                    output.ln().ln();
                    output.indent().shell(true).span('npm update ' + notifier.update.name + ' -g');
                    output.ln();

                    notifier = null;
                }
            });
        }
        cli.showUpdateNotifier = showUpdateNotifier;
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var ua = require('universal-analytics');
    var uuid = require('uuid');
    var urlMod = require('url');

    (function (cli) {
        var Tracker = (function () {
            function Tracker() {
                this._client = getDummy();
                this._eventQueue = [];
                this._workers = [];
                this._workersMax = 50;
                this._workersGrow = 10;
            }
            Tracker.prototype.init = function (context, enabled, debug) {
                if (typeof enabled === "undefined") { enabled = true; }
                if (typeof debug === "undefined") { debug = false; }
                xm.assertVar(context, tsd.Context, 'context');
                xm.assertVar(enabled, 'boolean', 'enabled');

                this._context = context;
                this._enabled = enabled;
                this._debug = debug;

                this._accountID = context.settings.getString('tracker/accountID');
                this._enabled = context.settings.getBoolean('tracker/enabled');

                this._minor = this._context.packageInfo.version.match(/^\d+\.\d+/)[0];
                this._page = [
                    '',
                    this._context.packageInfo.name,
                    this._context.packageInfo.version,
                    this._context.config.repoOwner,
                    this._context.config.repoProject,
                    this._context.config.ref
                ].join('/');

                if (!this._enabled) {
                    return;
                }
                if (!this._accountID || !/^UA-\d+-\d+$/.test(this._accountID)) {
                    throw new Error('invalid accountID: ' + this._accountID);
                }

                this._client = ua(this._accountID, uuid.v4());
                if (this._debug) {
                    this._client = this._client.debug();
                }
            };

            Tracker.prototype.getPage = function (parts) {
                return this._page + (parts && parts.length > 0 ? '/' + parts.join('/') : '');
            };

            Tracker.prototype.pageview = function () {
                var parts = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    parts[_i] = arguments[_i + 0];
                }
                this._client.pageview(this.getPage(parts)).send();
            };

            Tracker.prototype.query = function (query) {
                this.sendEvent({
                    ec: 'query',
                    ea: query.patterns.map(function (matcher) {
                        return matcher.pattern;
                    }).join(' '),
                    dp: this.getPage()
                });
            };

            Tracker.prototype.install = function (action, result) {
                var _this = this;
                result.written.forEach(function (value) {
                    _this.sendEvent({
                        ec: action,
                        ea: value.def.path,
                        dp: _this.getPage()
                    });
                });
            };

            Tracker.prototype.browser = function (url) {
                var parts = urlMod.parse(url);
                this.sendEvent({
                    ec: 'browser',
                    ea: (parts.path + (parts.hash || '')),
                    dp: this.getPage()
                });
            };

            Tracker.prototype.visit = function (url) {
                this.sendEvent({
                    ec: 'visit',
                    ea: url,
                    dp: this.getPage()
                });
            };

            Tracker.prototype.error = function (err) {
                if (err) {
                    if (err.message) {
                        this._client.exception(err.message).send();
                    } else {
                        this._client.exception(String(err)).send();
                    }
                }
            };

            Tracker.prototype.sendEvent = function (event) {
                if (!this._enabled) {
                    return;
                }
                if (event) {
                    this._eventQueue.push(event);
                }

                var grow = 0;
                while (this._eventQueue.length > 0 && this._workers.length < this._workersMax && grow < this._workersGrow) {
                    this.doEvent(this._eventQueue.pop());
                    grow++;
                }
            };

            Tracker.prototype.doEvent = function (event) {
                var _this = this;
                this._workers.push(event);
                if (this._debug) {
                    xm.log.debug('event', event);
                }
                this._client.event(event, function (err) {
                    var i = _this._workers.indexOf(event);
                    if (i > -1) {
                        _this._workers.splice(i, 1);
                    }
                    if (!err) {
                        _this.sendEvent();
                    }
                });
            };

            Tracker.prototype.getTimer = function (variable, label) {
                var _this = this;
                if (!this._enabled) {
                    return function (err) {
                    };
                }
                var start = Date.now();
                return function (err) {
                    if (!err) {
                        var duration = Date.now() - start;
                        if (_this._debug) {
                            xm.log.debug('timer', duration + 'ms');
                        }
                        _this._client.timing(_this.getPage(), variable, duration, label).send();
                    }
                };
            };

            Object.defineProperty(Tracker.prototype, "client", {
                get: function () {
                    return this._client;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Tracker.prototype, "enabled", {
                get: function () {
                    return this._enabled;
                },
                set: function (enabled) {
                    if (enabled !== this._enabled) {
                        this._enabled = enabled;
                        if (this._debug) {
                            xm.log.status('Tracker ' + (this._enabled ? 'enabled' : 'disabled'));
                        }
                    }
                },
                enumerable: true,
                configurable: true
            });

            return Tracker;
        })();
        cli.Tracker = Tracker;

        function getDummy() {
            var dummy = {
                debug: function () {
                    return dummy;
                },
                send: function () {
                    return dummy;
                },
                pageview: function () {
                    return dummy;
                },
                event: function () {
                    return dummy;
                },
                transaction: function () {
                    return dummy;
                },
                item: function () {
                    return dummy;
                },
                exception: function () {
                    return dummy;
                },
                timing: function () {
                    return dummy;
                }
            };
            return dummy;
        }
        cli.getDummy = getDummy;
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var miniwrite = require('miniwrite');
    var ministyle = require('ministyle');

    (function (cli) {
        var StyleMap = (function () {
            function StyleMap(output) {
                var _this = this;
                this.outputs = new Set();
                xm.assertVar(output, xm.StyledOut, 'output');

                this.addOutput(output);

                this._styleMap = new Map();

                this._styleMap.set('no', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.plain());
                    });
                });
                this._styleMap.set('plain', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.plain());
                    });
                });
                this._styleMap.set('ansi', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.ansi());
                    });
                });
                this._styleMap.set('html', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.html(true));
                        output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
                    });
                });
                this._styleMap.set('css', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.css('', true));
                        output.useWrite(miniwrite.htmlString(miniwrite.log(), 'span', { 'class': 'cli' }, '<br/>'));
                    });
                });
                this._styleMap.set('dev', function (ctx) {
                    _this.outputs.forEach(function (output) {
                        output.useStyle(ministyle.dev());
                    });
                });
            }
            StyleMap.prototype.addOutput = function (output) {
                this.outputs.add(output);
            };

            StyleMap.prototype.getKeys = function () {
                return xm.keysOf(this._styleMap);
            };

            StyleMap.prototype.useStyle = function (color, ctx) {
                if (this._styleMap.has(color)) {
                    this._styleMap.get(color)(ctx);
                } else {
                    this._styleMap.get('plain')(ctx);
                }
            };
            return StyleMap;
        })();
        cli.StyleMap = StyleMap;
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    function enumNames(enumer) {
        return Object.keys(enumer).filter(function (value) {
            return !/\d+/.test(value);
        });
    }
    xm.enumNames = enumNames;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    (function (cli) {
        (function (Opt) {
            Opt.version = 'version';
            Opt.verbose = 'verbose';
            Opt.style = 'style';
            Opt.dev = 'dev';
            Opt.config = 'config';
            Opt.cacheDir = 'cacheDir';
            Opt.cacheMode = 'cacheMode';
            Opt.resolve = 'resolve';
            Opt.save = 'save';
            Opt.bundle = 'bundle';
            Opt.overwrite = 'overwrite';
            Opt.min = 'min';
            Opt.max = 'max';
            Opt.limit = 'limit';
            Opt.timeout = 'timeout';
            Opt.commit = 'commit';
            Opt.semver = 'semver';
            Opt.date = 'date';
            Opt.progress = 'progress';

            Opt.action = 'action';
            Opt.info = 'info';
            Opt.history = 'history';
            Opt.detail = 'detail';
            Opt.services = 'services';
        })(cli.Opt || (cli.Opt = {}));
        var Opt = cli.Opt;
        xm.object.lockPrimitives(Opt);

        (function (Group) {
            Group.primary = 'primary';
            Group.query = 'query';
            Group.support = 'support';
            Group.help = 'help';
        })(cli.Group || (cli.Group = {}));
        var Group = cli.Group;
        xm.object.lockPrimitives(Group);

        (function (Action) {
            Action.install = 'install';
            Action.open = 'open';
            Action.browse = 'browse';
            Action.visit = 'visit';
            Action.compare = 'compare';
            Action.update = 'update';
        })(cli.Action || (cli.Action = {}));
        var Action = cli.Action;
        xm.object.lockPrimitives(Action);
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    (function (cli) {
        function addCommon(expose, print, style) {
            expose.defineOption(function (opt) {
                opt.name = 'help';
                opt.short = 'h';
                opt.description = 'display usage help';
                opt.type = 'flag';
                opt.command = 'help';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.version;
                opt.short = 'V';
                opt.description = 'display version information';
                opt.type = 'flag';
                opt.command = 'version';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.dev;
                opt.description = 'development mode';
                opt.type = 'flag';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.style;
                opt.description = 'specify CLI style';
                opt.type = 'string';
                opt.placeholder = 'name';
                opt.global = true;
                opt.enum = style.getKeys();
                opt.default = (process.stdout['isTTY'] ? 'ansi' : 'no');
                opt.apply = function (value, ctx) {
                    style.useStyle(value, ctx);
                };
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.progress;
                opt.short = 'p';
                opt.description = 'display progress notifications';
                opt.type = 'flag';
                opt.global = true;
                opt.default = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.verbose;
                opt.description = 'verbose output';
                opt.type = 'flag';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.detail;
                opt.description = 'modify reporting detail level';
                opt.type = 'string';
                opt.global = true;
                opt.placeholder = 'level';
                opt.default = xm.ExposeLevel.med;
                opt.enum = ['low', 'mid', 'high'];
                opt.note = ['partially implemented'];
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.services;
                opt.description = 'allow usage-tracker, TSD updates etc';
                opt.type = 'flag';
                opt.default = true;
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.semver;
                opt.short = 'v';
                opt.description = 'filter on version postfix';
                opt.type = 'string';
                opt.placeholder = 'range';
                opt.default = 'latest';
                opt.note = [
                    'semver-range | latest | all',
                    'example: ">0.2.4"'
                ];
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.date;
                opt.short = 'd';
                opt.description = 'filter on commit date';
                opt.type = 'string';
                opt.placeholder = 'range';
                opt.note = ['example: "<2012-12-31"'];
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.commit;
                opt.short = 'c';
                opt.description = 'filter on commit hash';
                opt.type = 'string';
                opt.placeholder = 'sha1';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.info;
                opt.short = 'i';
                opt.description = 'display definition file info';
                opt.type = 'flag';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.history;
                opt.short = 'y';
                opt.description = 'display commit history';
                opt.type = 'flag';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.resolve;
                opt.short = 'r';
                opt.description = 'include reference dependencies';
                opt.type = 'flag';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.config;
                opt.description = 'path to config file';
                opt.type = 'string';
                opt.placeholder = 'path';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.cacheDir;
                opt.description = 'path to cache directory';
                opt.type = 'string';
                opt.placeholder = 'path';
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.cacheMode;
                opt.description = 'change cache behaviour';
                opt.type = 'string';
                opt.placeholder = 'mode';
                opt.default = xm.http.CacheMode[5 /* allowUpdate */];
                opt.enum = xm.enumNames(xm.http.CacheMode);
                opt.global = true;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.overwrite;
                opt.short = 'o';
                opt.description = 'overwrite existing files';
                opt.type = 'flag';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.limit;
                opt.short = 'l';
                opt.description = 'sanity limit for expensive API calls';
                opt.type = 'int';
                opt.default = 2;
                opt.placeholder = 'num';
                opt.note = ['0 = unlimited'];
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.max;
                opt.description = 'enforce a maximum amount of results';
                opt.type = 'int';
                opt.default = 0;
                opt.placeholder = 'num';
                opt.note = ['0 = unlimited'];
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.min;
                opt.description = 'enforce a minimum amount of results';
                opt.type = 'int';
                opt.default = 0;
                opt.placeholder = 'num';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.save;
                opt.short = 's';
                opt.description = 'save changes to config file';
                opt.type = 'flag';
                opt.default = false;
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.bundle;
                opt.short = 'b';
                opt.description = 'save to reference bundle';
                opt.type = 'string[]';
                opt.placeholder = 'name';
            });

            expose.defineOption(function (opt) {
                opt.name = tsd.cli.Opt.action;
                opt.short = 'a';
                opt.description = 'run action on selection';
                opt.type = 'string';
                opt.placeholder = 'name';
                opt.enum = [tsd.cli.Action.install, tsd.cli.Action.browse, tsd.cli.Action.visit];
            });
        }
        cli.addCommon = addCommon;
    })(tsd.cli || (tsd.cli = {}));
    var cli = tsd.cli;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Job = (function () {
        function Job() {
        }
        return Job;
    })();
    tsd.Job = Job;

    

    function getExpose() {
        var path = require('path');
        var Q = require('q');
        var FS = require('q-io/fs');
        var yaml = require('js-yaml');

        var miniwrite = require('miniwrite');
        var ministyle = require('ministyle');

        var Opt = tsd.cli.Opt;
        var Group = tsd.cli.Group;
        var Action = tsd.cli.Action;

        var output = new xm.StyledOut();
        if (!process.stdout['isTTY']) {
            output.useStyle(ministyle.plain());
        }
        var print = new tsd.cli.Printer(output);
        var styles = new tsd.cli.StyleMap(output);
        var tracker = new tsd.cli.Tracker();

        function init(ctx) {
            return Q.resolve();
        }

        function showHeader() {
            var pkg = xm.PackageJSON.getLocal();

            output.ln().report(true).tweakPunc(pkg.getNameVersion()).ln();

            return Q.resolve();
        }

        function runUpdateNotifier(ctx, context) {
            if (ctx.getOpt(Opt.services)) {
                return tsd.cli.runUpdateNotifier(context, false);
            }
            return Q.resolve();
        }

        function getContext(ctx) {
            xm.assertVar(ctx, xm.ExposeContext, 'ctx');

            var context = new tsd.Context(ctx.getOpt(Opt.config), ctx.getOpt(Opt.verbose));

            tracker.init(context, (ctx.getOpt(Opt.services) && context.config.stats), ctx.getOpt(Opt.verbose));

            if (ctx.getOpt(Opt.dev)) {
                context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
            } else if (ctx.hasOpt(Opt.cacheDir)) {
                context.paths.cacheDir = path.resolve(ctx.getOpt(Opt.cacheDir));
            } else if (!context.paths.cacheDir) {
                context.paths.cacheDir = tsd.Paths.getUserCacheDir();
            }

            return Q.resolve(context);
        }

        var defaultJobOptions = [Opt.config];

        function jobOptions(merge) {
            if (typeof merge === "undefined") { merge = []; }
            return defaultJobOptions.concat(merge);
        }

        function getAPIJob(ctx) {
            var d = Q.defer();

            init(ctx).then(function () {
                return getContext(ctx).then(function (context) {
                    var job = new Job();
                    job.context = context;

                    job.ctx = ctx;
                    job.api = new tsd.API(job.context);

                    job.options = new tsd.Options();

                    job.options.timeout = ctx.getOpt(Opt.timeout);
                    job.options.limitApi = ctx.getOpt(Opt.limit);
                    job.options.minMatches = ctx.getOpt(Opt.min);
                    job.options.maxMatches = ctx.getOpt(Opt.max);

                    job.options.saveToConfig = ctx.getOpt(Opt.save);
                    job.options.overwriteFiles = ctx.getOpt(Opt.overwrite);
                    job.options.resolveDependencies = ctx.getOpt(Opt.resolve);
                    job.options.addToBundles = ctx.getOpt(Opt.bundle);

                    if (ctx.hasOpt(Opt.cacheMode)) {
                        job.api.core.useCacheMode(ctx.getOpt(Opt.cacheMode));
                    }

                    return job.api.readConfig(true).progress(d.notify).then(function () {
                        tracker.enabled = (tracker.enabled && job.context.config.stats);

                        return runUpdateNotifier(ctx, job.context);
                    }).then(function () {
                        d.resolve(job);
                    });
                });
            }).fail(d.reject);

            return d.promise;
        }

        function getSelectorJob(ctx) {
            var d = Q.defer();

            getAPIJob(ctx).progress(d.notify).then(function (job) {
                if (ctx.numArgs < 1) {
                    throw new Error('pass at least one query pattern');
                }
                job.query = new tsd.Query();
                for (var i = 0, ii = ctx.numArgs; i < ii; i++) {
                    job.query.addNamePattern(ctx.getArgAt(i));
                }

                job.query.versionMatcher = new tsd.VersionMatcher(ctx.getOpt(Opt.semver));

                if (ctx.hasOpt(Opt.commit)) {
                    job.query.commitMatcher = new tsd.CommitMatcher(ctx.getOpt(Opt.commit));
                }
                if (ctx.hasOpt(Opt.date)) {
                    job.query.dateMatcher = new tsd.DateMatcher(ctx.getOpt(Opt.date));
                }

                job.query.parseInfo = ctx.getOpt(Opt.info);
                job.query.loadHistory = ctx.getOpt(Opt.history);

                if (ctx.getOptAs(Opt.verbose, 'boolean')) {
                    output.span('CLI job.query').info().inspect(job.query, 3);
                }
                return job;
            }).then(d.resolve, d.reject);

            return d.promise;
        }

        var expose = new xm.Expose(output);

        function getProgress(ctx) {
            if (ctx.getOpt(Opt.progress)) {
                return print.reportProgress;
            }
            return function (note) {
            };
        }

        function reportError(err, head) {
            if (typeof head === "undefined") { head = true; }
            tracker.error(err);
            print.reportError(err, head);
        }

        expose.before = function (ctx) {
            return showHeader();
        };

        expose.end = function (ctx) {
            if (!ctx.error) {
                return tsd.cli.showUpdateNotifier(output);
            }
            return null;
        };

        expose.defineGroup(function (group) {
            group.name = Group.query;
            group.label = 'main';
            group.options = [Opt.config, Opt.cacheDir, Opt.min, Opt.max, Opt.limit];
            group.sorter = function (one, two) {
                var sort;

                sort = xm.exposeSortHasElem(one.groups, two.groups, Group.query);
                if (sort !== 0) {
                    return sort;
                }
                return xm.exposeSortIndex(one, two);
            };
        });

        expose.defineGroup(function (group) {
            group.name = Group.support;
            group.label = 'support';
            group.options = [];
            group.sorter = function (one, two) {
                var sort;

                sort = xm.exposeSortHasElem(one.groups, two.groups, Group.primary);
                if (sort !== 0) {
                    return sort;
                }
                sort = xm.exposeSortHasElem(one.groups, two.groups, Group.support);
                if (sort !== 0) {
                    return sort;
                }
                return xm.exposeSortIndex(one, two);
            };
        });

        expose.defineGroup(function (group) {
            group.name = Group.help;
            group.label = 'help';
        });

        tsd.cli.addCommon(expose, print, styles);

        expose.defineCommand(function (cmd) {
            cmd.name = 'help';
            cmd.label = 'display usage help';
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                return getContext(ctx).then(function (context) {
                    ctx.out.ln();
                    ctx.expose.reporter.printCommands(ctx.getOpt(Opt.detail));

                    return runUpdateNotifier(ctx, context);
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'version';
            cmd.label = 'display tsd version info';
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                return getContext(ctx).then(function (context) {
                    ctx.out.ln();
                    ctx.out.line(xm.PackageJSON.getLocal().getNameVersion());

                    return runUpdateNotifier(ctx, context);
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'init';
            cmd.label = 'create empty config file';
            cmd.options = [Opt.config, Opt.overwrite];
            cmd.groups = [Group.support, Group.primary];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    return job.api.initConfig(ctx.getOpt(Opt.overwrite)).progress(notify).then(function (target) {
                        output.ln().info().success('written').sp().span(target).ln();
                    }, function (err) {
                        output.ln().info().error('error').sp().span(err.message).ln();
                        throw (err);
                    });
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'settings';
            cmd.label = 'display config settings';
            cmd.options = [Opt.config, Opt.cacheDir];
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    output.ln();
                    var opts = {
                        indent: 3,
                        flowLevel: -1
                    };
                    return output.plain(yaml.safeDump(job.api.context.getInfo(true), {
                        skipInvalid: false,
                        schema: yaml.DEFAULT_FULL_SCHEMA,
                        indent: 3
                    }));
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'purge';
            cmd.label = 'clear local caches';
            cmd.options = [Opt.cacheDir];
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    return job.api.purge(true, true).progress(notify).then(function () {
                    });
                }).fail(reportError);
            };
        });

        var queryActions = new xm.ActionMap();
        queryActions.set(Action.install, function (ctx, job, selection) {
            return job.api.install(selection, job.options).then(function (result) {
                print.installResult(result);

                tracker.install('install', result);
            });
        });
        queryActions.set(Action.browse, function (ctx, job, selection) {
            return job.api.browse(selection.selection).then(function (opened) {
                if (opened.length > 0) {
                    print.output.ln();
                    opened.forEach(function (url) {
                        print.output.note(true).line(url);
                        tracker.browser(url);
                    });
                }
            });
        });
        queryActions.set(Action.visit, function (ctx, job, selection) {
            return job.api.visit(selection.selection).then(function (opened) {
                if (opened.length > 0) {
                    print.output.ln();
                    opened.forEach(function (url) {
                        print.output.note(true).line(url);
                        tracker.visit(url);
                    });
                }
            });
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'query';
            cmd.label = 'search definitions using one or more globbing patterns';
            cmd.examples = [
                ['tsd query d3 --info --history', 'view d3 info & history'],
                ['tsd query mocha --action install', 'install mocha'],
                ['tsd query jquery.*/*', 'search jquery plugins'],
                ['tsd query angular* --resolve', 'list angularjs bundle']
            ];
            cmd.variadic = ['...pattern'];
            cmd.groups = [Group.primary, Group.query];
            cmd.options = [
                Opt.info, Opt.history,
                Opt.semver, Opt.date, Opt.commit,
                Opt.action,
                Opt.resolve, Opt.overwrite, Opt.save, Opt.bundle
            ];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getSelectorJob(ctx).then(function (job) {
                    tracker.query(job.query);

                    return job.api.select(job.query, job.options).progress(notify).then(function (selection) {
                        if (selection.selection.length === 0) {
                            output.ln().report().warning('zero results').ln();
                            return;
                        }
                        output.line();

                        selection.selection.sort(tsd.DefUtil.fileCompare).forEach(function (file, i) {
                            print.fileHead(file);
                            print.fileInfo(file, true);
                            print.dependencies(file);
                            print.history(file);

                            output.cond(i < selection.selection.length - 1, '\n');
                        });

                        return Q().then(function () {
                            var action = ctx.getOpt(Opt.action);
                            if (!action) {
                                return;
                            }
                            if (!queryActions.has(action)) {
                                output.ln().report().warning('unknown action:').space().span(action).ln();
                                return;
                            }
                            output.ln().report(true).span('running').space().accent(action).span('..').ln();

                            return queryActions.run(action, function (run) {
                                return run(ctx, job, selection);
                            }, true).progress(notify).fail(function (err) {
                                output.report().span(action).space().error('error!').ln();
                                reportError(err, false);
                            });
                        });
                    });
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'reinstall';
            cmd.label = 're-install definitions from config';
            cmd.options = [Opt.overwrite, Opt.save];
            cmd.groups = [Group.support, Group.primary];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    output.line();
                    output.info(true).span('running').space().accent(cmd.name).ln();

                    return job.api.reinstall(job.options).progress(notify).then(function (result) {
                        print.installResult(result);

                        tracker.install('reinstall', result);
                    });
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'update';
            cmd.label = 'update definitions from config';
            cmd.options = [Opt.overwrite, Opt.save];
            cmd.groups = [Group.support, Group.primary];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    output.line();
                    output.info(true).span('running').space().accent(cmd.name).ln();

                    return job.api.update(job.options).progress(notify).then(function (result) {
                        print.installResult(result);

                        tracker.install('update', result);
                    });
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'rate';
            cmd.label = 'check github rate-limit';
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getAPIJob(ctx).progress(notify).then(function (job) {
                    return job.api.getRateInfo().progress(notify).then(function (info) {
                        print.rateInfo(info, false, true);
                    });
                }).fail(reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'validate';
            cmd.label = 'validate data source';
            cmd.hidden = true;
            cmd.groups = [Group.support];
            cmd.execute = function (ctx) {
                var notify = getProgress(ctx);
                return getContext(ctx).then(function (context) {
                    var job = new Job();
                    job.context = context;

                    job.ctx = ctx;
                    job.api = new tsd.API(job.context);

                    job.query = new tsd.Query('*');
                    job.query.parseInfo = true;

                    job.options = new tsd.Options();
                    job.options.resolveDependencies = true;

                    if (ctx.hasOpt(Opt.cacheMode)) {
                        job.api.core.useCacheMode(ctx.getOpt(Opt.cacheMode));
                    }

                    return job.api.readConfig(true).progress(notify).then(function () {
                        return job.api.select(job.query, job.options).progress(notify).then(function (selection) {
                            if (selection.selection.length === 0) {
                                output.ln().report().warning('zero results').ln();
                                return;
                            }

                            var invalid = [];
                            selection.selection.forEach(function (def) {
                                if (!def.commit || !def.info) {
                                    invalid.push(def);
                                    return;
                                }
                                if (!def.info.name || !def.info.projectUrl || def.info.authors.length === 0) {
                                    invalid.push(def);
                                    return;
                                }
                            });
                            if (invalid.length > 0) {
                                output.line();
                                output.info(true).span('found').space().error(invalid.length).space().span('invalid defs').ln();
                                output.inspect(invalid, 3);
                            }
                        });
                    });
                }).fail(reportError);
            };
        });

        return expose;
    }
    tsd.getExpose = getExpose;

    function runARGV(argvRaw) {
        getExpose().executeArgv(argvRaw, 'help');
    }
    tsd.runARGV = runARGV;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    function getAPI(configPath, verbose) {
        if (typeof verbose === "undefined") { verbose = false; }
        xm.assertVar(configPath, 'string', 'configPath');
        return new tsd.API(new tsd.Context(configPath, verbose));
    }
    tsd.getAPI = getAPI;
})(tsd || (tsd = {}));

module.exports = tsd;
