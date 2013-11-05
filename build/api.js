var xm;
(function (xm) {
    'use strict';

    var hasProp = Object.prototype.hasOwnProperty;

    var KeyValueMap = (function () {
        function KeyValueMap(data) {
            this._store = Object.create(null);
            if (data) {
                this.import(data);
            }
            Object.defineProperty(this, '_store', { enumerable: false, writable: false });
        }
        KeyValueMap.prototype.has = function (key) {
            return hasProp.call(this._store, key);
        };

        KeyValueMap.prototype.get = function (key, alt) {
            if (typeof alt === "undefined") { alt = null; }
            if (typeof key !== 'string') {
                throw new Error('key must be a string');
            }
            if (hasProp.call(this._store, key)) {
                return this._store[key];
            }
            return alt;
        };

        KeyValueMap.prototype.set = function (key, value) {
            this._store[key] = value;
        };

        KeyValueMap.prototype.remove = function (key) {
            if (hasProp.call(this._store, key)) {
                delete this._store[key];
            }
        };

        KeyValueMap.prototype.keys = function () {
            return Object.keys(this._store);
        };

        KeyValueMap.prototype.values = function () {
            var ret = [];
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    ret.push(this._store[key]);
                }
            }
            return ret;
        };

        KeyValueMap.prototype.clear = function () {
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    delete this._store[key];
                }
            }
        };

        KeyValueMap.prototype.import = function (data) {
            if (!data || typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') {
                return;
            }
            for (var key in data) {
                if (hasProp.call(data, key)) {
                    this._store[key] = data[key];
                }
            }
        };

        KeyValueMap.prototype.export = function () {
            var ret = {};
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    ret[key] = this._store[key];
                }
            }
            return ret;
        };
        return KeyValueMap;
    })();
    xm.KeyValueMap = KeyValueMap;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Set = (function () {
        function Set(values) {
            this._content = [];
            if (values) {
                this.import(values);
            }
        }
        Set.prototype.has = function (value) {
            return this._content.indexOf(value) > -1;
        };

        Set.prototype.add = function (value) {
            if (this._content.indexOf(value) < 0) {
                this._content.push(value);
            }
        };

        Set.prototype.remove = function (value) {
            var i = this._content.indexOf(value);
            if (i > -1) {
                this._content.splice(i, 1);
            }
        };

        Set.prototype.values = function () {
            return this._content.slice(0);
        };

        Set.prototype.import = function (values) {
            for (var i = 0, ii = values.length; i < ii; i++) {
                this.add(values[i]);
            }
        };

        Set.prototype.clear = function () {
            this._content = [];
        };

        Set.prototype.count = function () {
            return this._content.length;
        };
        return Set;
    })();
    xm.Set = Set;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function callAsync(callback) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        process.nextTick(function () {
            callback.apply(null, args);
        });
    }
    xm.callAsync = callAsync;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    tsd.Const = {
        ident: 'tsd',
        configFile: 'tsd.json',
        cacheDir: 'tsd-cache',
        configSchemaFile: 'tsd-v4.json',
        typingsFolder: 'typings',
        configVersion: 'v4',
        definitelyRepo: 'borisyankov/DefinitelyTyped',
        mainBranch: 'master',
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

    (function (FileUtil) {
        function parseJson(text) {
            var json;
            try  {
                json = JSON.parse(text);
            } catch (err) {
                if (err.name === 'SyntaxError') {
                    xm.log.error(err);
                    xm.log('---');
                    xm.log(text);
                    xm.log('---');
                }

                throw (err);
            }
            return json;
        }

        function doReadJSONSync(src) {
            return parseJson(fs.readFileSync(src, { encoding: 'utf8' }));
        }

        function readJSONSync(src) {
            var json;

            json = doReadJSONSync(src);

            return json;
        }
        FileUtil.readJSONSync = readJSONSync;

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
        FileUtil.readJSON = readJSON;

        function readJSONPromise(src) {
            return FS.read(src, { encoding: 'utf8' }).then(function (text) {
                return parseJson(text);
            });
        }
        FileUtil.readJSONPromise = readJSONPromise;

        function writeJSONSync(dest, data) {
            dest = path.resolve(dest);
            xm.FileUtil.mkdirCheckSync(path.dirname(dest));
            fs.writeFileSync(dest, JSON.stringify(data, null, 2), { encoding: 'utf8' });
        }
        FileUtil.writeJSONSync = writeJSONSync;

        function writeJSONPromise(dest, data) {
            var d = Q.defer();

            dest = path.resolve(dest);
            xm.FileUtil.mkdirCheckQ(path.dirname(dest), true).then(function (dest) {
                return FS.write(dest, JSON.stringify(data, null, 2), { encoding: 'utf8' });
            }).then(function () {
                d.resolve(null);
            }, d.reject);

            return d.promise;
        }
        FileUtil.writeJSONPromise = writeJSONPromise;

        function readFileSync(dest, encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            return fs.readFileSync(dest, { encoding: encoding });
        }
        FileUtil.readFileSync = readFileSync;

        function writeFileSync(dest, data, encoding) {
            if (typeof encoding === "undefined") { encoding = 'utf8'; }
            dest = path.resolve(dest);
            xm.FileUtil.mkdirCheckSync(path.dirname(dest));
            fs.writeFileSync(dest, data, { encoding: encoding });
        }
        FileUtil.writeFileSync = writeFileSync;

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
        FileUtil.mkdirCheckSync = mkdirCheckSync;

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
        FileUtil.mkdirCheckQ = mkdirCheckQ;

        function canWriteFile(targetPath, overwrite) {
            return FS.exists(targetPath).then(function (exists) {
                if (!exists) {
                    return true;
                }
                return FS.isFile(targetPath).then(function (isFile) {
                    if (isFile) {
                        return overwrite;
                    }

                    return false;
                });
            });
        }
        FileUtil.canWriteFile = canWriteFile;
    })(xm.FileUtil || (xm.FileUtil = {}));
    var FileUtil = xm.FileUtil;
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
            if (collection.hasOwnProperty(prop)) {
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
            if (collection.hasOwnProperty(prop)) {
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
            if (collection.hasOwnProperty(prop)) {
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
            if (collection.hasOwnProperty(prop) && callback.call(thisArg, collection[prop], prop, collection)) {
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
        var type = typeOf(obj);
        return jsonTypes.indexOf(type) > -1;
    }
    xm.isJSONValue = isJSONValue;

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

        return function isType(obj, type) {
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

    function deepFreezeRecursive(object, active) {
        var value, prop;
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

    var ObjectUtil = (function () {
        function ObjectUtil() {
        }
        ObjectUtil.hasOwnProp = function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        ObjectUtil.defineProp = function (object, property, settings) {
            Object.defineProperty(object, property, settings);
        };

        ObjectUtil.defineProps = function (object, propertyNames, settings) {
            propertyNames.forEach(function (property) {
                ObjectUtil.defineProp(object, property, settings);
            });
        };

        ObjectUtil.hidePrefixed = function (object, ownOnly) {
            if (typeof ownOnly === "undefined") { ownOnly = true; }
            for (var property in object) {
                if (property.charAt(0) === '_' && (!ownOnly || ObjectUtil.hasOwnProp(object, property))) {
                    ObjectUtil.defineProp(object, property, { enumerable: false });
                }
            }
        };
        ObjectUtil.hideProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { enumerable: false });
            });
        };

        ObjectUtil.lockProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
            });
        };

        ObjectUtil.freezeProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
                Object.freeze(object[property]);
            });
        };

        ObjectUtil.deepFreeze = function (object) {
            if (xm.isObject(object) || xm.isArray(object)) {
                deepFreezeRecursive(object, []);
            }
        };
        return ObjectUtil;
    })();
    xm.ObjectUtil = ObjectUtil;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var util = require('util');
    var jsesc = require('jsesc');

    var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var stringEsc = {
        quotes: 'double'
    };
    var stringEscWrap = {
        json: true,
        quotes: 'double',
        wrap: true
    };
    var stringQuote = '"';

    var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var identEscWrap = {
        quotes: 'double',
        wrap: true
    };
    var intExp = /^\d+$/;

    var escapeRep = '\\$&';
    var escapeAdd = '\\$&$&';

    function splitFix(chars) {
        return chars.split('').map(function (char) {
            return '\\' + char;
        });
    }

    function getReplacerFunc(chars, values, addSelf) {
        if (typeof addSelf === "undefined") { addSelf = false; }
        return function (match) {
            var i = chars.indexOf(match);
            if (i > -1 && i < values.length) {
                return values[i] + (addSelf ? match : '');
            }
            return match;
        };
    }

    var nonPrintExp = /[\b\f\n\r\t\v\0\\]/g;
    var nonPrintChr = '\b\f\n\r\t\v\0\\'.split('');
    var nonPrintVal = splitFix('bfnrtv0\\');
    var nonPrintRep = getReplacerFunc(nonPrintChr, nonPrintVal);

    var nonPrintNotNLExp = /[\b\f\t\v\0\\]/g;
    var nonPrintNotNLChr = '\b\f\t\v\\'.split('');
    var nonPrintNotNLVal = splitFix('bftv0\\');
    var nonPrintNotNLRep = getReplacerFunc(nonPrintNotNLChr, nonPrintNotNLVal);

    var nonPrintNLExp = /[\r\n]/g;
    var nonPrintNLChr = ['\n', '\r'];
    var nonPrintNLVal = ['\\n', '\\r'];
    var nonPrintNLRep = getReplacerFunc(nonPrintNLChr, nonPrintNLVal);

    function wrapIfComplex(input, args) {
        if (!identAnyExp.test(String(input))) {
            return jsesc(input, args || stringEscWrap);
        }
        return input;
    }
    xm.wrapIfComplex = wrapIfComplex;

    function stringDebug(input, newline) {
        if (typeof newline === "undefined") { newline = false; }
        if (newline) {
            return input.replace(nonPrintNotNLExp, nonPrintNotNLRep).replace(nonPrintNLExp, getReplacerFunc(nonPrintNLChr, nonPrintNLVal, true));
        }
        return input.replace(nonPrintExp, nonPrintRep);
    }
    xm.stringDebug = stringDebug;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function getFuncLabel(func) {
        var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(func);
        if (match && match.length >= 3) {
            return match[1] + '(' + match[2] + ')';
        }
        if (func.name) {
            return func.name;
        }
        return '<anonymous>';
    }
    xm.getFuncLabel = getFuncLabel;

    function toValueStrim(obj, depth) {
        if (typeof depth === "undefined") { depth = 4; }
        var type = xm.typeOf(obj);

        var strCut = 40;
        var objCut = 50;

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
                return trimLine(obj, strCut);
            case 'date':
                return obj.toISOString();
            case 'function':
                return xm.getFuncLabel(obj);
            case 'arguments':
            case 'array': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return '[' + trimLine(obj.map(function (value) {
                    return toValueStrim(value, depth);
                }).join(','), objCut, false) + ']';
            }
            case 'object': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return trimLine(String(obj) + ' {' + Object.keys(obj).sort().map(function (key) {
                    return trimLine(key) + ':' + toValueStrim(obj[key], depth);
                }).join(','), objCut, false) + '}';
            }
            default:
                throw (new Error('toValueStrim: cannot serialise type: ' + type));
        }
    }
    xm.toValueStrim = toValueStrim;

    function trimLine(value, cutoff, wrapQuotes) {
        if (typeof cutoff === "undefined") { cutoff = 30; }
        if (typeof wrapQuotes === "undefined") { wrapQuotes = true; }
        if (value.length > cutoff - 2) {
            value = value.substr(0, cutoff - 5) + '...';
        }
        return xm.wrapIfComplex(value, { quotes: wrapQuotes });
    }
    xm.trimLine = trimLine;
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

    function isMd5(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{32}$/.test(value);
    }

    var typeOfAssert = xm.getTypeOfMap({
        sha1: isSha,
        md5: isMd5
    });

    function assert(pass, message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        if (pass) {
            return;
        }
        if (message) {
            message.replace(/\{([\w+])\}/g, function (match, id) {
                switch (id) {
                    case 'act':
                        return xm.toValueStrim(actual);
                    case 'exp':
                        return xm.toValueStrim(expected);
                    default:
                        return '{' + id + '}';
                }
            });
            message += ': ';
        } else {
            message = '';
        }
        throw new AssertionError(message, { actual: actual, expected: expected, showDiff: showDiff }, ssf);
    }
    xm.assert = assert;

    function throwAssert(message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        message = message ? message + ': ' : '';
        throw new AssertionError(message, { actual: actual, expected: expected, showDiff: showDiff }, ssf);
    }
    xm.throwAssert = throwAssert;

    function assertVar(value, type, label, opt) {
        if (typeof opt === "undefined") { opt = false; }
        if (arguments.length < 3) {
            throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
        }
        var valueKind = xm.typeOf(value);
        var typeKind = xm.typeOf(type);

        if (valueKind === 'undefined' || valueKind === 'null') {
            if (!opt) {
                throw new AssertionError('expected "' + label + '" to be defined as a ' + xm.toValueStrim(type) + ' but got "' + value + '"');
            }
        } else if (typeKind === 'function') {
            if (!(value instanceof type)) {
                throw new AssertionError('expected "' + label + '" to be instanceof ' + xm.toValueStrim(type) + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
            }
        } else if (typeKind === 'string') {
            if (xm.hasOwnProp(typeOfAssert, type)) {
                var check = typeOfAssert[type];
                if (!check(value)) {
                    throw new AssertionError('expected "' + label + '" to be a ' + xm.toValueStrim(type) + ' but got "' + valueKind + '": ' + xm.toValueStrim(value));
                }
            } else {
                throw new AssertionError('unknown type-assertion parameter ' + xm.toValueStrim(type) + ' for "' + label + '"');
            }
        } else {
            throw new AssertionError('bad type-assertion parameter ' + xm.toValueStrim(type) + ' for "' + label + '"');
        }
    }
    xm.assertVar = assertVar;
})(xm || (xm = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var xm;
(function (xm) {
    (function (styler) {
        function clean(str) {
            return '' + str;
        }
        styler.clean = clean;

        var NoStyler = (function () {
            function NoStyler() {
            }
            NoStyler.prototype.ok = function (str) {
                return clean(str);
            };

            NoStyler.prototype.fail = function (str) {
                return clean(str);
            };

            NoStyler.prototype.warn = function (str) {
                return clean(str);
            };

            NoStyler.prototype.error = function (str) {
                return clean(str);
            };

            NoStyler.prototype.warning = function (str) {
                return clean(str);
            };

            NoStyler.prototype.success = function (str) {
                return clean(str);
            };

            NoStyler.prototype.accent = function (str) {
                return clean(str);
            };

            NoStyler.prototype.plain = function (str) {
                return clean(str);
            };

            NoStyler.prototype.zero = function () {
                return '';
            };
            return NoStyler;
        })();
        styler.NoStyler = NoStyler;

        var PlainStyler = (function (_super) {
            __extends(PlainStyler, _super);
            function PlainStyler() {
                _super.apply(this, arguments);
            }
            PlainStyler.prototype.ok = function (str) {
                return clean(str).toLocaleUpperCase();
            };

            PlainStyler.prototype.warn = function (str) {
                return clean(str).toLocaleUpperCase();
            };

            PlainStyler.prototype.fail = function (str) {
                return clean(str).toLocaleUpperCase();
            };
            return PlainStyler;
        })(NoStyler);
        styler.PlainStyler = PlainStyler;

        var WrapStyler = (function () {
            function WrapStyler() {
                this.styles = {};
            }
            WrapStyler.prototype.ok = function (str) {
                return this.success(clean(str));
            };

            WrapStyler.prototype.warn = function (str) {
                return this.warning(clean(str));
            };

            WrapStyler.prototype.fail = function (str) {
                return this.error(clean(str));
            };

            WrapStyler.prototype.error = function (str) {
                return this.wrap(clean(str), 'red');
            };

            WrapStyler.prototype.warning = function (str) {
                return this.wrap(clean(str), 'yellow');
            };

            WrapStyler.prototype.success = function (str) {
                return this.wrap(clean(str), 'green');
            };

            WrapStyler.prototype.accent = function (str) {
                return this.wrap(clean(str), 'cyan');
            };

            WrapStyler.prototype.plain = function (str) {
                return clean(str);
            };

            WrapStyler.prototype.zero = function () {
                return '';
            };

            WrapStyler.prototype.wrap = function (str, style) {
                if (!this.styles.hasOwnProperty(style)) {
                    return clean(str);
                }
                var tmp = this.styles[style];
                return tmp[0] + clean(str) + tmp[1];
            };
            return WrapStyler;
        })();
        styler.WrapStyler = WrapStyler;

        styler.ansiWrapTable = {
            'bold': ['\033[1m', '\033[22m'],
            'italic': ['\033[3m', '\033[23m'],
            'underline': ['\033[4m', '\033[24m'],
            'inverse': ['\033[7m', '\033[27m'],
            'white': ['\033[37m', '\033[39m'],
            'grey': ['\033[90m', '\033[39m'],
            'black': ['\033[30m', '\033[39m'],
            'blue': ['\033[34m', '\033[39m'],
            'cyan': ['\033[36m', '\033[39m'],
            'green': ['\033[32m', '\033[39m'],
            'magenta': ['\033[35m', '\033[39m'],
            'red': ['\033[31m', '\033[39m'],
            'yellow': ['\033[33m', '\033[39m']
        };

        var ANSIWrapStyler = (function (_super) {
            __extends(ANSIWrapStyler, _super);
            function ANSIWrapStyler() {
                _super.call(this);
                this.styles = styler.ansiWrapTable;
            }
            return ANSIWrapStyler;
        })(WrapStyler);
        styler.ANSIWrapStyler = ANSIWrapStyler;

        var ANSIStyler = (function () {
            function ANSIStyler() {
            }
            ANSIStyler.prototype.ok = function (str) {
                return '\033[32m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.fail = function (str) {
                return '\033[31m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.warn = function (str) {
                return '\033[33m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.error = function (str) {
                return '\033[31m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.warning = function (str) {
                return '\033[33m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.success = function (str) {
                return '\033[32m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.accent = function (str) {
                return '\033[36m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.plain = function (str) {
                return clean(str);
            };

            ANSIStyler.prototype.zero = function () {
                return '';
            };
            return ANSIStyler;
        })();
        styler.ANSIStyler = ANSIStyler;

        styler.htmlWrapTable = {
            'bold': ['<b>', '</b>'],
            'italic': ['<i>', '</i>'],
            'underline': ['<u>', '</u>'],
            'inverse': ['<span style="background-color:black;color:white;">', '</span>'],
            'white': ['<span style="color:white;">', '</span>'],
            'grey': ['<span style="color:grey;">', '</span>'],
            'black': ['<span style="color:black;">', '</span>'],
            'blue': ['<span style="color:blue;">', '</span>'],
            'cyan': ['<span style="color:cyan;">', '</span>'],
            'green': ['<span style="color:green;">', '</span>'],
            'magenta': ['<span style="color:magenta;">', '</span>'],
            'red': ['<span style="color:red;">', '</span>'],
            'yellow': ['<span style="color:yellow;">', '</span>']
        };

        var HTMLWrapStyler = (function (_super) {
            __extends(HTMLWrapStyler, _super);
            function HTMLWrapStyler() {
                _super.call(this);
                this.styles = styler.htmlWrapTable;
            }
            return HTMLWrapStyler;
        })(WrapStyler);
        styler.HTMLWrapStyler = HTMLWrapStyler;

        var CSSStyler = (function (_super) {
            __extends(CSSStyler, _super);
            function CSSStyler(prefix) {
                _super.call(this);
                if (typeof prefix === 'string') {
                    this.prefix = prefix;
                } else {
                    this.prefix = 'styler-';
                }
            }
            CSSStyler.prototype.ok = function (str) {
                return this.wrap(str, 'ok');
            };

            CSSStyler.prototype.warn = function (str) {
                return this.wrap(str, 'warn');
            };

            CSSStyler.prototype.fail = function (str) {
                return this.wrap(str, 'fail');
            };

            CSSStyler.prototype.error = function (str) {
                return this.wrap(str, 'error');
            };

            CSSStyler.prototype.warning = function (str) {
                return this.wrap(str, 'warning');
            };

            CSSStyler.prototype.success = function (str) {
                return this.wrap(str, 'success');
            };

            CSSStyler.prototype.accent = function (str) {
                return this.wrap(str, 'accent');
            };

            CSSStyler.prototype.plain = function (str) {
                return this.wrap(str, 'plain');
            };

            CSSStyler.prototype.wrap = function (str, style) {
                return '<span class="' + this.prefix + style + '">' + clean(str) + '</span>';
            };
            return CSSStyler;
        })(WrapStyler);
        styler.CSSStyler = CSSStyler;

        var DevStyler = (function () {
            function DevStyler() {
            }
            DevStyler.prototype.ok = function (str) {
                return '[ok|' + clean(str) + ']';
            };

            DevStyler.prototype.fail = function (str) {
                return '[fail|' + clean(str) + ']';
            };

            DevStyler.prototype.warn = function (str) {
                return '[warn|' + clean(str) + ']';
            };

            DevStyler.prototype.error = function (str) {
                return '[error|' + clean(str) + ']';
            };

            DevStyler.prototype.warning = function (str) {
                return '[warning|' + clean(str) + ']';
            };

            DevStyler.prototype.success = function (str) {
                return '[success|' + clean(str) + ']';
            };

            DevStyler.prototype.accent = function (str) {
                return '[accent|' + clean(str) + ']';
            };

            DevStyler.prototype.plain = function (str) {
                return '[plain|' + clean(str) + ']';
            };

            DevStyler.prototype.zero = function () {
                return '[zero]';
            };
            return DevStyler;
        })();
        styler.DevStyler = DevStyler;
    })(xm.styler || (xm.styler = {}));
    var styler = xm.styler;
})(xm || (xm = {}));
var xm;
(function (xm) {
    (function (writer) {
        var lineBreak = /\r?\n/;

        var LineWriter = (function () {
            function LineWriter() {
                this.textBuffer = '';
            }
            LineWriter.prototype.start = function () {
                this.textBuffer = '';
            };

            LineWriter.prototype.finalise = function () {
                this.flushLineBuffer();
            };

            LineWriter.prototype.write = function (str) {
                if (str === '') {
                    return;
                }
                this.textBuffer += str;

                var arr = this.textBuffer.split(lineBreak);
                var len = arr.length;
                if (len > 0) {
                    for (var i = 0; i < len - 1; i++) {
                        this.flushLine(arr[i]);
                    }
                    this.textBuffer = arr[len - 1];
                }
            };

            LineWriter.prototype.writeln = function (str) {
                if (arguments.length === 0 || (this.textBuffer === '' && str === '')) {
                    this.flushLine('');
                    return;
                }
                this.textBuffer += str;

                var arr = this.textBuffer.split(lineBreak);
                var len = arr.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        this.flushLine(arr[i]);
                    }
                    this.textBuffer = '';
                }
            };

            LineWriter.prototype.flushLine = function (str) {
            };

            LineWriter.prototype.flushLineBuffer = function () {
                if (this.textBuffer.length > 0) {
                    var arr = this.textBuffer.split(lineBreak);
                    var len = arr.length;
                    if (len > 0) {
                        for (var i = 0; i < len; i++) {
                            this.flushLine(arr[i]);
                        }
                        this.textBuffer = '';
                    }
                }
            };
            return LineWriter;
        })();
        writer.LineWriter = LineWriter;

        var ConsoleLineWriter = (function (_super) {
            __extends(ConsoleLineWriter, _super);
            function ConsoleLineWriter() {
                _super.apply(this, arguments);
            }
            ConsoleLineWriter.prototype.flushLine = function (str) {
                console.log(str);
            };
            return ConsoleLineWriter;
        })(LineWriter);
        writer.ConsoleLineWriter = ConsoleLineWriter;

        var BufferWriter = (function () {
            function BufferWriter(seperator) {
                if (typeof seperator !== 'string') {
                    this.seperator = '\n';
                } else {
                    this.seperator = seperator;
                }
            }
            BufferWriter.prototype.start = function () {
                this.buffer = '';
            };

            BufferWriter.prototype.write = function (str) {
                if (str) {
                    this.buffer += str;
                }
            };

            BufferWriter.prototype.writeln = function (str) {
                if (arguments.length > 0 && str.length > 0) {
                    this.buffer += str + this.seperator;
                } else {
                    this.buffer += this.seperator;
                }
            };

            BufferWriter.prototype.finalise = function () {
            };
            return BufferWriter;
        })();
        writer.BufferWriter = BufferWriter;

        var ConsoleBufferWriter = (function (_super) {
            __extends(ConsoleBufferWriter, _super);
            function ConsoleBufferWriter() {
                _super.apply(this, arguments);
            }
            ConsoleBufferWriter.prototype.finalise = function () {
                if (this.buffer.length > 0) {
                    console.log(this.buffer);
                }
                this.buffer = '';
            };
            return ConsoleBufferWriter;
        })(BufferWriter);
        writer.ConsoleBufferWriter = ConsoleBufferWriter;

        var WritableStreamWriter = (function (_super) {
            __extends(WritableStreamWriter, _super);
            function WritableStreamWriter(stream) {
                _super.call(this);
                this.stream = stream;
            }
            WritableStreamWriter.prototype.start = function () {
            };

            WritableStreamWriter.prototype.finalise = function () {
            };

            WritableStreamWriter.prototype.flushLine = function (str) {
                if (str.length > 0) {
                    this.stream.write(str + '\n', 'utf8');
                }
            };
            return WritableStreamWriter;
        })(LineWriter);
        writer.WritableStreamWriter = WritableStreamWriter;

        var NullWriter = (function () {
            function NullWriter() {
            }
            NullWriter.prototype.start = function () {
            };

            NullWriter.prototype.finalise = function () {
            };

            NullWriter.prototype.write = function (str) {
            };

            NullWriter.prototype.writeln = function (str) {
            };
            return NullWriter;
        })();
        writer.NullWriter = NullWriter;
    })(xm.writer || (xm.writer = {}));
    var writer = xm.writer;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var util = require('util');

    var StyledOut = (function () {
        function StyledOut(writer, styler) {
            if (typeof writer === "undefined") { writer = null; }
            if (typeof styler === "undefined") { styler = null; }
            this.nibs = {
                arrow: '-> ',
                double: '>> ',
                bullet: ' - ',
                edge: ' | ',
                none: '   '
            };
            this._writer = (writer || new xm.writer.ConsoleLineWriter());
            this._styler = (styler || new xm.styler.ANSIStyler());

            this._writer.start();

            xm.ObjectUtil.hidePrefixed(this);
        }
        StyledOut.prototype.write = function (str) {
            this._writer.write(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.line = function (str) {
            if (typeof str === "undefined") { str = ''; }
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.ln = function () {
            this._writer.writeln(this._styler.zero());
            return this;
        };

        StyledOut.prototype.span = function (str) {
            this._writer.write(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.block = function (str) {
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.clear = function () {
            this._writer.writeln(this._styler.zero());
            this._writer.writeln(this._styler.zero());
            return this;
        };

        StyledOut.prototype.ruler = function () {
            this._writer.writeln('--------');
            return this;
        };

        StyledOut.prototype.ruler2 = function () {
            this._writer.writeln('----');
            return this;
        };

        StyledOut.prototype.h1 = function (str) {
            this._writer.writeln(this._styler.accent(str));
            this.ruler();
            this._writer.writeln();
            return this;
        };

        StyledOut.prototype.h2 = function (str) {
            this._writer.writeln(this._styler.accent(str));
            this.ruler();
            return this;
        };

        StyledOut.prototype.plain = function (str) {
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.accent = function (str) {
            this._writer.write(this._styler.accent(str));
            return this;
        };

        StyledOut.prototype.space = function () {
            this._writer.write(this._styler.plain(' '));
            return this;
        };

        StyledOut.prototype.success = function (str) {
            this._writer.write(this._styler.success(str));
            return this;
        };

        StyledOut.prototype.warning = function (str) {
            this._writer.write(this._styler.warning(str));
            return this;
        };

        StyledOut.prototype.error = function (str) {
            this._writer.write(this._styler.error(str));
            return this;
        };

        StyledOut.prototype.ok = function (str) {
            this._writer.writeln(this._styler.ok(str));
            return this;
        };

        StyledOut.prototype.warn = function (str) {
            this._writer.writeln(this._styler.warn(str));
            return this;
        };

        StyledOut.prototype.fail = function (str) {
            this._writer.writeln(this._styler.fail(str));
            return this;
        };

        StyledOut.prototype.cond = function (condition, str, alt) {
            if (condition) {
                this._writer.write(this._styler.plain(str));
            } else if (arguments.length > 2) {
                this._writer.write(this._styler.plain(alt));
            }
            return this;
        };

        StyledOut.prototype.inspect = function (value, depth, showHidden) {
            if (typeof depth === "undefined") { depth = 4; }
            if (typeof showHidden === "undefined") { showHidden = false; }
            this._writer.writeln(this._styler.plain(util.inspect(value, { showHidden: showHidden, depth: depth })));
            return this;
        };

        StyledOut.prototype.stringWrap = function (str) {
            this._writer.write(this._styler.plain(xm.wrapIfComplex(str)));
            return this;
        };

        StyledOut.prototype.label = function (label) {
            this._writer.write(this._styler.plain(xm.wrapIfComplex(label) + ': '));
            return this;
        };

        StyledOut.prototype.indent = function () {
            this._writer.write(this.nibs.none);
            return this;
        };

        StyledOut.prototype.bullet = function () {
            this._writer.write(this._styler.accent(this.nibs.bullet));
            return this;
        };

        StyledOut.prototype.index = function (num) {
            this._writer.write(this._styler.plain(String(num) + +': '));
            return this;
        };

        StyledOut.prototype.info = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._writer.write(this._styler.accent(this.nibs.arrow));
            } else {
                this._writer.write(this._styler.plain(this.nibs.arrow));
            }
            return this;
        };

        StyledOut.prototype.report = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._writer.write(this._styler.accent(this.nibs.double));
            } else {
                this._writer.write(this._styler.plain(this.nibs.double));
            }
            return this;
        };

        StyledOut.prototype.unfunk = function () {
            this.useStyler(new xm.styler.NoStyler());
            return this;
        };

        StyledOut.prototype.finalise = function () {
            this._writer.finalise();
        };

        StyledOut.prototype.useWriter = function (writer) {
            xm.assertVar(writer, 'object', 'writer');
            this._writer.finalise();
            this._writer = writer;
            this._writer.start();
            return this;
        };

        StyledOut.prototype.useStyler = function (styler) {
            xm.assertVar(styler, 'object', 'styler');
            this._styler = styler;
            return this;
        };

        Object.defineProperty(StyledOut.prototype, "writer", {
            get: function () {
                return this._writer;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(StyledOut.prototype, "styler", {
            get: function () {
                return this._styler;
            },
            enumerable: true,
            configurable: true
        });
        return StyledOut;
    })();
    xm.StyledOut = StyledOut;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var path = require('path');

    (function (stack) {
        var stackExp = /^ *at (.*?) \((.*?)(?::(\d+))?(?::(\d+))?\)$/gm;

        var Stackline = (function () {
            function Stackline() {
                this.line = NaN;
                this.column = NaN;
            }
            Stackline.prototype.getLink = function () {
                if (!this.file) {
                    return '';
                }
                if (isNaN(this.line)) {
                    return this.file;
                }
                var ret = '[' + this.line;
                if (!isNaN(this.column)) {
                    ret += ',' + this.column;
                }
                return this.file + ret + ']';
            };
            return Stackline;
        })();
        stack.Stackline = Stackline;

        function getRawStack(err) {
            err = err || new Error();
            if (err.stack) {
                if (typeof (chrome) !== 'undefined' || typeof (process) !== 'undefined') {
                    return err.stack.replace(/\n[^\n]*/, '');
                } else if (typeof (Components) !== 'undefined') {
                    return err.stack.substring(err.stack.indexOf('\n') + 1);
                } else {
                    return err.stack;
                }
            }
            return '';
        }
        stack.getRawStack = getRawStack;

        function isAbsolute(str) {
            str = path.normalize(str);
            var resolve = path.resolve(str);
            if (resolve === str) {
                return true;
            }
            return false;
        }

        function trimInternalLines(lines) {
            var cut = lines.length - 1;
            while (cut > 0) {
                var line = lines[cut];
                if (!line.internal) {
                    break;
                }
                cut--;
            }
            return lines.slice(0, cut + 1);
        }
        stack.trimInternalLines = trimInternalLines;

        function lineFromMatch(match) {
            var len = match.length;

            var line = new Stackline();
            line.call = match[1];

            line.file = len > 1 ? match[2] : '';

            line.line = len > 2 ? parseInt(match[3], 10) : NaN;
            line.column = len > 3 ? parseInt(match[4], 10) : NaN;

            line.link = line.getLink();

            line.absolute = isAbsolute(line.file);
            line.internal = !line.absolute;
            return line;
        }

        function getStackLines(keep, offset, trim, err) {
            if (typeof keep === "undefined") { keep = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            if (typeof trim === "undefined") { trim = false; }
            var stack = getRawStack(err);

            var trimTop = 2 + offset;
            var keepBottom = keep + offset;

            var line;
            var lines = [];
            var match;

            stackExp.lastIndex = 0;

            while ((match = stackExp.exec(stack))) {
                stackExp.lastIndex = match.index + match[0].length;

                trimTop--;
                if (trimTop > 0) {
                    continue;
                }
                line = lineFromMatch(match);

                lines.push(line);

                if (keep > 0) {
                    keepBottom--;
                    if (keepBottom <= 0) {
                        break;
                    }
                }
            }
            if (trim) {
                lines = trimInternalLines(lines);
            }
            return lines;
        }
        stack.getStackLines = getStackLines;
    })(xm.stack || (xm.stack = {}));
    var stack = xm.stack;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');
    require('colors');

    xm.consoleOut = new xm.StyledOut();

    function writeMulti(logger, args) {
        var ret = [];
        for (var i = 0, ii = args.length; i < ii; i++) {
            var value = args[i];
            if (value && typeof value === 'object') {
                ret.push(util.inspect(value, { showHidden: false, depth: 8 }));
            } else {
                ret.push(value);
            }
        }
        logger.out.line(ret.join('; '));
    }

    function getLogger(label) {
        label = arguments.length > 0 ? (String(label) + ' ') : '';

        var precall = function () {
        };

        var plain = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                writeMulti(logger, args);
            }
        };

        var doLog = function (logger, args) {
            if (args.length > 0) {
                logger.out.span(' ');
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
                precall();
                logger.out.span('-> ').success(label + 'ok');
                doLog(logger, args);
            }
        };
        logger.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').warning(label + 'warning');
                doLog(logger, args);
            }
        };
        logger.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').error(label + 'error');
                doLog(logger, args);
            }
        };
        logger.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').accent(label + 'debug');
                doLog(logger, args);
            }
        };
        logger.inspect = function (value, depth, label) {
            if (typeof depth === "undefined") { depth = 3; }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').inspect(value, depth);
            }
        };
        logger.json = function (value, label) {
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').block(JSON.stringify(value, null, 3));
            }
        };

        return logger;
    }
    xm.getLogger = getLogger;

    xm.log = getLogger();
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

            xm.ObjectUtil.hidePrefixed(this);
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
                PackageJSON._local = new PackageJSON(xm.FileUtil.readJSONSync(src), src);
            }
            return PackageJSON._local;
        };
        return PackageJSON;
    })();
    xm.PackageJSON = PackageJSON;
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
        Object.defineProperty(Def.prototype, "pathTerm", {
            get: function () {
                return this.path.replace(/\.d\.ts$/, '');
            },
            enumerable: true,
            configurable: true
        });

        Def.prototype.toString = function () {
            return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
        };

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
                return semver.valid(sem);
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

                if (semver.valid(sem)) {
                    file.semver = sem;
                    file.name = file.name.substr(0, semMatch.index);
                } else {
                }
            }

            xm.ObjectUtil.lockProps(file, ['path', 'project', 'name']);

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
var tsd;
(function (tsd) {
    'use strict';

    var endSlashTrim = /\/?$/;

    var DefInfo = (function () {
        function DefInfo() {
            this.references = [];
            this.resetAll();
        }
        DefInfo.prototype.resetFields = function () {
            this.name = '';
            this.version = '';
            this.submodule = '';
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
            var ret = this.name;
            if (this.submodule) {
                ret += ' ' + this.submodule;
            }
            if (this.version) {
                ret += ' ' + this.version;
            }
            if (this.description) {
                ret += ' ' + JSON.stringify(this.description);
            }
            return ret;
        };

        DefInfo.prototype.isValid = function () {
            if (!this.name) {
                return false;
            }
            if (this.authors.length === 0) {
                return false;
            }

            if (!this.reposUrl) {
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

        function blobShaHex(data, encoding) {
            xm.assertVar(data, Buffer, 'data');
            return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data, encoding).digest('hex');
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

            xm.ObjectUtil.defineProps(this, ['sha', 'encoding'], { writable: false });

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

            var sha = git.GitUtil.blobShaHex(content, encoding || this.encoding);
            if (sha !== this.sha) {
                xm.throwAssert('blob sha mismatch: ' + sha + ' != ' + this.sha, sha, this.sha);
            }

            xm.ObjectUtil.defineProp(this, 'content', { writable: true });
            this.content = content;
            xm.ObjectUtil.defineProp(this, 'content', { writable: false, enumerable: false });
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

            xm.ObjectUtil.hidePrefixed(this);
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
    var AssertionError = require('assertion-error');
    var tv4 = require('tv4');

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
            this._installed = new xm.KeyValueMap();
            this.log = xm.getLogger('Config');
            xm.assertVar(schema, 'object', 'schema');
            xm.assert((schema.version !== tsd.Const.configVersion), 'bad schema config version', schema.version, tsd.Const.configVersion, true);

            this._schema = schema;

            this.path = tsd.Const.typingsFolder;
            this.version = tsd.Const.configVersion;
            this.repo = tsd.Const.definitelyRepo;
            this.ref = tsd.Const.mainBranch;

            xm.ObjectUtil.hidePrefixed(this);
            Object.defineProperty(this, 'log', { enumerable: false });
        }
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
            return this._installed.get(filePath, null);
        };

        Config.prototype.removeFile = function (filePath) {
            xm.assertVar(filePath, 'string', 'filePath');
            this._installed.remove(filePath);
        };

        Config.prototype.getInstalled = function () {
            return this._installed.values();
        };

        Config.prototype.getInstalledPaths = function () {
            return this._installed.values().map(function (file) {
                return file.path;
            });
        };

        Config.prototype.toJSON = function () {
            var json = {
                path: this.path,
                version: this.version,
                repo: this.repo,
                ref: this.ref,
                installed: {}
            };

            this._installed.values().forEach(function (file) {
                json.installed[file.path] = {
                    commit: file.commitSha
                };
            });
            var res = tv4.validateResult(json, this._schema);
            if (!res.valid || res.missing.length > 0) {
                this.log.warn(res.error.message);
                return null;
            }
            return json;
        };

        Config.prototype.parseJSON = function (json) {
            var _this = this;
            xm.assertVar(json, 'object', 'json');

            this._installed.clear();

            var res = tv4.validateResult(json, this._schema);

            if (!res.valid || res.missing.length > 0) {
                this.log.error(res.error.message);
                if (res.error.dataPath) {
                    this.log.warn(res.error.dataPath);
                }

                throw (new Error('malformed config: doesn\'t comply with json-schema: ' + res.error.message + (res.error.dataPath ? ': ' + res.error.dataPath : '')));
            }

            this.path = json.path;
            this.version = json.version;
            this.repo = json.repo;
            this.ref = json.ref;

            if (json.installed) {
                xm.eachProp(json.installed, function (data, filePath) {
                    var installed = new tsd.InstalledDef(filePath);

                    installed.commitSha = data.commit;

                    _this._installed.set(filePath, installed);
                });
            }
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

        Paths.getUserCacheRoot = function () {
            return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
        };

        Paths.getUserCacheDir = function () {
            return path.resolve(Paths.getUserCacheRoot(), Paths.getCacheDirName());
        };
        return Paths;
    })();
    tsd.Paths = Paths;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');

    var Context = (function () {
        function Context(configFile, verbose) {
            if (typeof configFile === "undefined") { configFile = null; }
            if (typeof verbose === "undefined") { verbose = false; }
            this.configFile = configFile;
            this.verbose = verbose;
            this.log = xm.getLogger('Context');
            xm.assertVar(configFile, 'string', 'configFile', true);

            this.packageInfo = xm.PackageJSON.getLocal();

            this.paths = new tsd.Paths();
            if (configFile) {
                this.paths.configFile = path.resolve(configFile);
            }
            var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));

            this.config = new tsd.Config(schema);
        }
        Context.prototype.getTypingsDir = function () {
            return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
        };

        Context.prototype.logInfo = function (details) {
            if (typeof details === "undefined") { details = false; }
            this.log(this.packageInfo.getNameVersion());
            this.log('repo: ' + this.config.repo + ' #' + this.config.ref);
            if (details) {
                this.log('paths', this.paths);
                this.log('config', this.config);
                this.log('resolved typings', this.config.resolveTypingsPath(path.dirname(this.paths.configFile)));
                this.log('installed', this.config.getInstalled());
            }
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
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            var _this = this;
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
        NameMatcher.prototype.filter = function (list) {
            return list.filter(this.getFilterFunc());
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

        NameMatcher.prototype.getFilterFunc = function () {
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
        InfoMatcher.prototype.test = function (info) {
            return true;
        };
        return InfoMatcher;
    })();
    tsd.InfoMatcher = InfoMatcher;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Selector = (function () {
        function Selector(pattern) {
            if (typeof pattern === "undefined") { pattern = '*'; }
            this.timeout = 10000;
            this.minMatches = 0;
            this.maxMatches = 0;
            this.limitApi = 0;
            this.overwriteFiles = false;
            this.resolveDependencies = false;
            this.saveToConfig = false;
            xm.assertVar(pattern, 'string', 'pattern');
            this.pattern = new tsd.NameMatcher(pattern);
        }
        Object.defineProperty(Selector.prototype, "requiresHistory", {
            get: function () {
                return !!(this.beforeDate || this.afterDate);
            },
            enumerable: true,
            configurable: true
        });

        Selector.prototype.toString = function () {
            return this.pattern.pattern;
        };
        return Selector;
    })();
    tsd.Selector = Selector;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    'use strict';

    var StatCounter = (function () {
        function StatCounter(log) {
            if (typeof log === "undefined") { log = false; }
            this.log = log;
            this.stats = new xm.KeyValueMap();
            this.logger = xm.log;
        }
        StatCounter.prototype.count = function (id, label) {
            var value = this.stats.get(id, 0) + 1;
            this.stats.set(id, value);

            if (this.log && this.logger) {
                this.logger('-> ' + id + ': ' + this.stats.get(id) + (label ? ': ' + label : ''));
            }
            return value;
        };

        StatCounter.prototype.get = function (id) {
            return this.stats.get(id, 0);
        };

        StatCounter.prototype.has = function (id) {
            return this.stats.has(id);
        };

        StatCounter.prototype.zero = function () {
            var _this = this;
            this.stats.keys().forEach(function (id) {
                _this.stats.set(id, 0);
            });
        };

        StatCounter.prototype.total = function () {
            return this.stats.values().reduce(function (memo, value) {
                return memo + value;
            }, 0);
        };

        StatCounter.prototype.counterNames = function () {
            return this.stats.keys();
        };

        StatCounter.prototype.hasAllZero = function () {
            return !this.stats.values().some(function (value) {
                return value !== 0;
            });
        };

        StatCounter.prototype.clear = function () {
            this.stats.clear();
        };

        StatCounter.prototype.getReport = function (label) {
            var _this = this;
            var ret = [];
            var keys = this.stats.keys();
            keys.sort();
            keys.forEach(function (id) {
                ret.push(id + ': ' + _this.stats.get(id));
            });
            return (label ? label + ':\n' : '') + ret.join('\n');
        };
        return StatCounter;
    })();
    xm.StatCounter = StatCounter;
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

    var CachedJSONValue = (function () {
        function CachedJSONValue(label, key, options) {
            this.key = null;
            this.label = null;
            this.value = null;
            this.changed = null;
            this.options = null;
            xm.assertVar(label, 'string', 'label');
            xm.assertVar(key, 'string', 'key');
            this.label = label;
            this.key = key;
            this.options = options || null;
            xm.ObjectUtil.lockProps(this, ['label', 'key', 'options']);
            Object.defineProperty(this, 'value', { enumerable: false });
        }
        CachedJSONValue.prototype.setValue = function (value, changed) {
            if (this.value) {
                throw new Error('already have a value');
            }
            if (!xm.isJSONValue(value)) {
                throw new Error('cannot store non-JSON values: ' + xm.typeOf(value));
            }
            xm.assertVar(changed, Date, 'changed', true);

            this.value = value;
            this.changed = changed || new Date();
            Object.freeze(this.changed);
            xm.ObjectUtil.lockProps(this, ['value', 'changed']);
        };

        CachedJSONValue.prototype.toJSON = function () {
            var hash = this.getKeyHash();
            var checksum = xm.sha1(hash + xm.jsonToIdentHash(this.value));

            return {
                key: this.key,
                hash: hash,
                checksum: checksum,
                value: this.value,
                label: this.label,
                changed: this.changed.toISOString()
            };
        };

        CachedJSONValue.fromJSON = function (json) {
            xm.assertVar(json.label, 'string', 'label');
            xm.assertVar(json.key, 'string', 'key');
            xm.assertVar(json.hash, 'sha1', 'hash');
            xm.assertVar(json.checksum, 'sha1', 'checksum');
            xm.assertVar(json.changed, 'string', 'changed');

            var changedDateNum = Date.parse(json.changed);
            if (isNaN(changedDateNum)) {
                throw new Error('bad date: invalid date: ' + json.date);
            }

            var call = new xm.CachedJSONValue(json.label, json.key, json.options);
            call.setValue(json.value, new Date(changedDateNum));

            var checksum = xm.sha1(call.getKeyHash() + xm.jsonToIdentHash(call.value));
            if (checksum !== json.checksum) {
                throw new Error('json checksum mismatch');
            }
            return call;
        };

        CachedJSONValue.getHash = function (key) {
            return xm.sha1(key);
        };

        CachedJSONValue.prototype.getKeyHash = function () {
            return xm.sha1(this.key);
        };
        return CachedJSONValue;
    })();
    xm.CachedJSONValue = CachedJSONValue;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var FS = require('q-io/fs');
    var path = require('path');

    var CachedJSONStore = (function () {
        function CachedJSONStore(storeFolder) {
            this.stats = new xm.StatCounter();
            this._formatVersion = '0.2';
            xm.assertVar(storeFolder, 'string', 'storeFolder');

            storeFolder = storeFolder.replace(/[\\\/]+$/, '') + '-fmt' + this._formatVersion;

            this._dir = path.resolve(storeFolder);

            this.stats.logger = xm.getLogger('CachedJSONStore');

            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedJSONStore.prototype.init = function () {
            var _this = this;
            var defer = Q.defer();

            this.stats.count('init');

            FS.exists(this._dir).then(function (exists) {
                if (!exists) {
                    _this.stats.count('init-dir-create', _this._dir);
                    return xm.FileUtil.mkdirCheckQ(_this._dir, true);
                }

                return FS.isDirectory(_this._dir).then(function (isDir) {
                    if (isDir) {
                        _this.stats.count('init-dir-exists', _this._dir);
                        return null;
                    }
                    _this.stats.count('init-dir-error', _this._dir);
                    throw new Error('is not a directory: ' + _this._dir);
                });
            }).then(function () {
                defer.resolve(null);
            }, function (err) {
                _this.stats.count('init-error');
                defer.reject(err);
            });

            return defer.promise;
        };

        CachedJSONStore.prototype.getValue = function (key) {
            var _this = this;
            var defer = Q.defer();

            var src = path.join(this._dir, xm.CachedJSONValue.getHash(key) + '.json');
            this.stats.count('get');

            this.init().then(function () {
                return FS.exists(src);
            }).then(function (exists) {
                if (exists) {
                    _this.stats.count('get-exists');

                    return xm.FileUtil.readJSONPromise(src).then(function (json) {
                        var cached;
                        try  {
                            cached = xm.CachedJSONValue.fromJSON(json);
                        } catch (e) {
                            _this.stats.count('get-read-error');

                            defer.resolve(null);
                        }
                        _this.stats.count('get-read-success');
                        defer.resolve(cached);
                    }, function (err) {
                        if (err.name === 'SyntaxError') {
                            _this.stats.count('get-read-parse-error', src);
                            defer.resolve(null);
                        }

                        throw err;
                    });
                }
                _this.stats.count('get-miss');
                defer.resolve(null);
            }).fail(function (err) {
                _this.stats.count('get-error');
                defer.reject(err);
            });

            return defer.promise;
        };

        CachedJSONStore.prototype.storeValue = function (res) {
            var _this = this;
            var defer = Q.defer();

            var dest = path.join(this._dir, res.getKeyHash() + '.json');

            this.stats.count('store');

            this.init().then(function () {
                return FS.exists(dest);
            }).then(function (exists) {
                if (exists) {
                    _this.stats.count('store-exists');
                    return FS.remove(dest);
                }
                _this.stats.count('store-new');
                return xm.FileUtil.mkdirCheckQ(path.dirname(dest), true);
            }).then(function () {
                _this.stats.count('store-write');
                var data = JSON.stringify(res.toJSON(), null, 2);
                return FS.write(dest, data);
            }).then(function () {
                _this.stats.count('store-write-success');
                defer.resolve(res);
            }, function (err) {
                _this.stats.count('store-write-error');
                defer.reject(err);
            });

            return defer.promise;
        };
        return CachedJSONStore;
    })();
    xm.CachedJSONStore = CachedJSONStore;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var _ = require('underscore');
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');

    var CachedLoaderOptions = (function () {
        function CachedLoaderOptions() {
            this.cacheRead = true;
            this.cacheWrite = true;
            this.remoteRead = true;
        }
        return CachedLoaderOptions;
    })();
    xm.CachedLoaderOptions = CachedLoaderOptions;

    var CachedLoader = (function () {
        function CachedLoader(label, service) {
            this._debug = false;
            this._options = new xm.CachedLoaderOptions();
            this._active = new xm.KeyValueMap();
            this._service = null;
            this.stats = new xm.StatCounter();
            xm.assertVar(label, 'string', 'label');
            xm.assertVar(service, 'object', 'service');

            this._service = service;
            this.stats.logger = xm.getLogger(label + '.CachedLoader');

            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedLoader.prototype.getKey = function (label, keyTerms) {
            return xm.jsonToIdent([label, keyTerms ? keyTerms : {}]);
        };

        CachedLoader.prototype.doCachedCall = function (label, keyTerms, opts, cachedCall) {
            var _this = this;
            var d = Q.defer();

            var key = xm.isString(keyTerms) ? keyTerms : this.getKey(label, keyTerms);

            opts = _.defaults(opts || {}, this._options);

            this.stats.count('start', label);

            if (this._debug) {
                xm.log.debug(opts);
                xm.log.debug(key);
            }

            if (this._active.has(key)) {
                this.stats.count('active-hit', label);

                this._active.get(key).then(function (content) {
                    _this.stats.count('active-resolve', label);
                    d.resolve(content);
                }, function (err) {
                    _this.stats.count('active-error', label);

                    d.reject(err);
                });

                return d.promise;
            }

            var cleanup = function () {
                _this.stats.count('active-remove', label);
                _this._active.remove(key);
            };

            this.cacheRead(opts, label, key).then(function (res) {
                if (!xm.isNull(res) && !xm.isUndefined(res)) {
                    _this.stats.count('cache-hit', label);
                    return res;
                }
                return _this.callLoad(opts, label, cachedCall).then(function (res) {
                    if (xm.isNull(res) || xm.isUndefined(res)) {
                        _this.stats.count('call-empty');
                        throw new Error('no result for: ' + label);
                    }
                    return _this.cacheWrite(opts, label, key, res).thenResolve(res);
                });
            }).then(function (res) {
                cleanup();
                _this.stats.count('complete', label);
                d.resolve(res);
            }, function (err) {
                cleanup();
                _this.stats.count('error', label);
                xm.log.error(err);

                d.reject(err);
            });

            this.stats.count('active-set', label);
            this._active.set(key, d.promise);

            return d.promise;
        };

        CachedLoader.prototype.cacheRead = function (opts, label, key) {
            var _this = this;
            var d = Q.defer();

            if (opts.cacheRead) {
                this.stats.count('read-start', label);
                this._service.getValue(key).then(function (res) {
                    if (xm.isNull(res) || xm.isUndefined(res)) {
                        _this.stats.count('read-miss', label);

                        d.resolve(null);
                    } else {
                        _this.stats.count('read-hit', label);
                        d.resolve(res);
                    }
                }, function (err) {
                    _this.stats.count('read-error', label);
                    xm.log.error(err);
                    d.reject(err);
                });
            } else {
                this.stats.count('read-skip', label);
                d.resolve(null);
            }
            return d.promise;
        };

        CachedLoader.prototype.callLoad = function (opts, label, cachedCall) {
            var _this = this;
            var d = Q.defer();

            if (opts.remoteRead) {
                this.stats.count('load-start', label);

                Q(cachedCall()).then(function (res) {
                    _this.stats.count('load-success', label);
                    d.resolve(res);
                }, function (err) {
                    _this.stats.count('load-error', label);
                    xm.log.error(err);
                    d.reject(err);
                });
            } else {
                this.stats.count('load-skip', label);
                d.resolve(null);
            }
            return d.promise;
        };

        CachedLoader.prototype.cacheWrite = function (opts, label, key, value) {
            var _this = this;
            var d = Q.defer();

            if (opts.cacheWrite) {
                this.stats.count('write-start', label);

                this._service.writeValue(key, label, value).then(function (info) {
                    _this.stats.count('write-success', label);
                    d.resolve(value);
                }, function (err) {
                    _this.stats.count('write-error', label);
                    xm.log.error(err);
                    d.reject(err);
                });
            } else {
                this.stats.count('write-skip', label);
                d.resolve(null);
            }
            return d.promise;
        };

        Object.defineProperty(CachedLoader.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(CachedLoader.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (value) {
                this._debug = value;
                this.stats.log = value;
            },
            enumerable: true,
            configurable: true
        });

        return CachedLoader;
    })();
    xm.CachedLoader = CachedLoader;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');

    var CachedJSONService = (function () {
        function CachedJSONService(dir) {
            xm.assertVar(dir, 'string', 'dir');

            this._store = new xm.CachedJSONStore(dir);

            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedJSONService.prototype.getCachedRaw = function (key) {
            return this._store.getValue(key);
        };

        CachedJSONService.prototype.getValue = function (key, opts) {
            return this._store.getValue(key).then(function (res) {
                if (res) {
                    return res.value;
                }
                return null;
            });
        };

        CachedJSONService.prototype.writeValue = function (key, label, value, opts) {
            var cached = new xm.CachedJSONValue(label, key);
            cached.setValue(value);
            return this._store.storeValue(cached).then(function (info) {
                return value;
            });
        };

        CachedJSONService.prototype.getKeys = function (opts) {
            return Q([]);
        };

        Object.defineProperty(CachedJSONService.prototype, "store", {
            get: function () {
                return this._store;
            },
            enumerable: true,
            configurable: true
        });
        return CachedJSONService;
    })();
    xm.CachedJSONService = CachedJSONService;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var uriTemplates = require('uri-templates');

    var URLManager = (function () {
        function URLManager(common) {
            this._templates = new xm.KeyValueMap();
            this._vars = new xm.KeyValueMap();
            if (common) {
                this.setVars(common);
            }
        }
        URLManager.prototype.addTemplate = function (id, url) {
            if (this._templates.has(id)) {
                throw (new Error('cannot redefine template: ' + id));
            }
            this._templates.set(id, uriTemplates(url));
        };

        URLManager.prototype.setVar = function (id, value) {
            this._vars.set(id, value);
        };

        URLManager.prototype.getVar = function (id) {
            return this._vars.get(id, null);
        };

        URLManager.prototype.setVars = function (map) {
            var _this = this;
            Object.keys(map).forEach(function (id) {
                _this.setVar(id, map[id]);
            });
        };

        URLManager.prototype.getTemplate = function (id) {
            if (!this._templates.has(id)) {
                throw (new Error('undefined url template: ' + id));
            }
            return this._templates.get(id);
        };

        URLManager.prototype.getURL = function (id, vars) {
            if (vars) {
                var obj = this._vars.export();
                Object.keys(vars).forEach(function (id) {
                    obj[id] = vars[id];
                });
                return this.getTemplate(id).fillFromObject(obj);
            }
            return this.getTemplate(id).fillFromObject(this._vars.export());
        };
        return URLManager;
    })();
    xm.URLManager = URLManager;
})(xm || (xm = {}));
var git;
(function (git) {
    'use strict';

    var GithubURLManager = (function (_super) {
        __extends(GithubURLManager, _super);
        function GithubURLManager(repo) {
            _super.call(this);
            this._base = 'https://github.com/{owner}/{project}';
            this._api = 'https://api.github.com/repos/{owner}/{project}';
            this._raw = 'https://raw.github.com/{owner}/{project}';
            xm.assertVar(repo, git.GithubRepo, 'repo');

            this.setVars({
                owner: repo.ownerName,
                project: repo.projectName
            });

            this.addTemplate('api', this._api);
            this.addTemplate('base', this._base);
            this.addTemplate('raw', this._raw);
            this.addTemplate('rawFile', this._raw + '/{commit}/{+path}');

            xm.ObjectUtil.hidePrefixed(this);
        }
        GithubURLManager.prototype.api = function () {
            return this.getURL('api');
        };

        GithubURLManager.prototype.base = function () {
            return this.getURL('base');
        };

        GithubURLManager.prototype.raw = function () {
            return this.getURL('raw');
        };

        GithubURLManager.prototype.rawFile = function (commit, path) {
            xm.assertVar(commit, 'string', 'commit');
            xm.assertVar(path, 'string', 'path');

            return this.getURL('rawFile', {
                commit: commit,
                path: path
            });
        };
        return GithubURLManager;
    })(xm.URLManager);
    git.GithubURLManager = GithubURLManager;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var GithubRepo = (function () {
        function GithubRepo(ownerName, projectName) {
            this.ownerName = ownerName;
            this.projectName = projectName;
            xm.assertVar(ownerName, 'string', 'ownerName');
            xm.assertVar(projectName, 'string', 'projectName');

            this.urls = new git.GithubURLManager(this);
        }
        GithubRepo.prototype.getCacheKey = function () {
            return this.ownerName + '-' + this.projectName;
        };

        GithubRepo.prototype.toString = function () {
            return this.ownerName + '/' + this.projectName;
        };
        return GithubRepo;
    })();
    git.GithubRepo = GithubRepo;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var GitRateLimitInfo = (function () {
        function GitRateLimitInfo() {
            this.limit = 0;
            this.remaining = 0;
            this.lastUpdate = new Date();
        }
        GitRateLimitInfo.prototype.readFromRes = function (response) {
            if (response && xm.isObject(response.meta)) {
                if (xm.ObjectUtil.hasOwnProp(response.meta, 'x-ratelimit-limit')) {
                    this.limit = parseInt(response.meta['x-ratelimit-limit'], 10);
                }
                if (xm.ObjectUtil.hasOwnProp(response.meta, 'x-ratelimit-remaining')) {
                    this.remaining = parseInt(response.meta['x-ratelimit-remaining'], 10);
                }
                this.lastUpdate = new Date();
            }
        };

        GitRateLimitInfo.prototype.toStatus = function () {
            return 'rate limit: ' + this.remaining + ' of ' + this.limit + ' @ ' + this.lastUpdate.toLocaleString();
        };

        GitRateLimitInfo.prototype.hasRemaining = function () {
            return this.remaining > 0;
        };
        return GitRateLimitInfo;
    })();
    git.GitRateLimitInfo = GitRateLimitInfo;
})(git || (git = {}));
var git;
(function (git) {
    'use strict';

    var _ = require('underscore');
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');

    var Github = require('github');

    var GithubAPICached = (function () {
        function GithubAPICached(repo, storeFolder) {
            this._apiVersion = '3.0.0';
            this._debug = false;
            xm.assertVar(repo, git.GithubRepo, 'repo');
            xm.assertVar(storeFolder, 'string', 'storeFolder');

            this._repo = repo;
            this._api = new Github({
                version: this._apiVersion
            });

            this._service = new xm.CachedJSONService(path.resolve(storeFolder, this.getCacheKey()));
            this._loader = new xm.CachedLoader('GithubAPICached', this._service);

            xm.ObjectUtil.hidePrefixed(this);
        }
        GithubAPICached.prototype.mergeParams = function (vars) {
            return _.defaults(vars || {}, {
                user: this._repo.ownerName,
                repo: this._repo.projectName
            });
        };

        GithubAPICached.prototype.getBranches = function () {
            var _this = this;
            var params = this.mergeParams({});
            return this._loader.doCachedCall('getBranches', params, {}, function () {
                return Q.nfcall(_this._api.repos.getBranches, params);
            });
        };

        GithubAPICached.prototype.getBranch = function (branch) {
            var _this = this;
            var params = this.mergeParams({
                branch: branch
            });
            return this._loader.doCachedCall('getBranch', params, {}, function () {
                return Q.nfcall(_this._api.repos.getBranch, params);
            });
        };

        GithubAPICached.prototype.getTree = function (sha, recursive) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha,
                recursive: recursive
            });
            return this._loader.doCachedCall('getTree', params, {}, function () {
                return Q.nfcall(_this._api.gitdata.getTree, params);
            });
        };

        GithubAPICached.prototype.getCommit = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha
            });
            return this._loader.doCachedCall('getCommit', params, {}, function () {
                return Q.nfcall(_this._api.gitdata.getCommit, params);
            });
        };

        GithubAPICached.prototype.getBlob = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha,
                per_page: 100
            });
            return this._loader.doCachedCall('getBlob', params, {}, function () {
                return Q.nfcall(_this._api.gitdata.getBlob, params);
            });
        };

        GithubAPICached.prototype.getCommits = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                per_page: 100,
                sha: sha
            });
            return this._loader.doCachedCall('getCommits', params, {}, function () {
                return Q.nfcall(_this._api.repos.getCommits, params);
            });
        };

        GithubAPICached.prototype.getPathCommits = function (sha, path) {
            var _this = this;
            var params = this.mergeParams({
                per_page: 100,
                sha: sha,
                path: path
            });
            return this._loader.doCachedCall('getCommits', params, {}, function () {
                return Q.nfcall(_this._api.repos.getCommits, params);
            });
        };

        Object.defineProperty(GithubAPICached.prototype, "service", {
            get: function () {
                return this._service;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(GithubAPICached.prototype, "loader", {
            get: function () {
                return this._loader;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(GithubAPICached.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (value) {
                this._debug = value;
                this._service.store.stats.log = value;
                this._loader.debug = value;
            },
            enumerable: true,
            configurable: true
        });


        GithubAPICached.prototype.getCacheKey = function () {
            return this._repo.getCacheKey() + '-api' + this._apiVersion;
        };
        return GithubAPICached;
    })();
    git.GithubAPICached = GithubAPICached;
})(git || (git = {}));
var xm;
(function (xm) {
    'use strict';

    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');

    var CachedFileService = (function () {
        function CachedFileService(dir) {
            this._extension = '';
            xm.assertVar(dir, 'string', 'dir');
            this.dir = dir;

            Object.defineProperty(this, 'dir', { writable: false });
            Object.defineProperty(this, '_extension', { writable: false, enumerable: false });
        }
        CachedFileService.prototype.getValue = function (file, opts) {
            var d = Q.defer();

            var storeFile = path.join(this.dir, file + this._extension);

            FS.exists(storeFile).then(function (exists) {
                if (exists) {
                    return FS.isFile(storeFile).then(function (isFile) {
                        if (!isFile) {
                            throw (new Error('path exists but is not a file: ' + storeFile));
                        }

                        return FS.read(storeFile, { flags: 'rb' }).then(d.resolve);
                    });
                }
                d.resolve(null);
            }).fail(function (err) {
                xm.log.error('CachedFileService.writeValue: failure');
                d.reject(err);
            });

            return d.promise;
        };

        CachedFileService.prototype.writeValue = function (file, label, value, opts) {
            var d = Q.defer();

            var storeFile = path.join(this.dir, file + this._extension);

            xm.FileUtil.mkdirCheckQ(path.dirname(storeFile), true).then(function () {
                return FS.write(storeFile, value, { flags: 'wb' });
            }).then(function () {
                d.resolve(value);
            }, function (err) {
                xm.log.error('CachedFileService.writeValue: failure');
                d.reject(err);
            });

            return d.promise;
        };

        CachedFileService.prototype.getKeys = function (opts) {
            return Q.resolve([]);
        };
        return CachedFileService;
    })();
    xm.CachedFileService = CachedFileService;
})(xm || (xm = {}));
var git;
(function (git) {
    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');
    var HTTP = require('q-io/http');

    var GithubRawCached = (function () {
        function GithubRawCached(repo, storeFolder) {
            this._debug = false;
            this._formatVersion = '0.2';
            this.stats = new xm.StatCounter(false);
            this.log = xm.getLogger('GithubRawCached');
            this.headers = {
                'User-Agent': 'xm.GithubRawCached'
            };
            xm.assertVar(repo, git.GithubRepo, 'repo');
            xm.assertVar(storeFolder, 'string', 'storeFolder');
            this._repo = repo;

            var dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);

            this._service = new xm.CachedFileService(dir);
            this._loader = new xm.CachedLoader('GithubRawCached', this._service);

            this.stats.logger = this.log;

            xm.ObjectUtil.hidePrefixed(this);
        }
        GithubRawCached.prototype.getFile = function (commitSha, filePath) {
            var _this = this;
            var d = Q.defer();

            this.stats.count('start');

            var tmp = filePath.split(/\/|\\\//g);
            tmp.unshift(commitSha);

            var storeFile = FS.join(tmp);

            if (this._debug) {
                this.log(storeFile);
            }

            this._loader.doCachedCall('GithubRawCached.getFile', storeFile, {}, function () {
                var req = HTTP.normalizeRequest(_this._repo.urls.rawFile(commitSha, filePath));
                req.headers = _this.headers;

                if (_this._debug) {
                    _this.log(req);
                }
                _this.stats.count('request-start');

                return HTTP.request(req).then(function (res) {
                    if (!res.status || res.status < 200 || res.status >= 400) {
                        _this.stats.count('request-error');
                        throw new Error('unexpected status code: ' + res.status);
                    }
                    if (_this._debug) {
                        _this.log.inspect(res, 1, 'res');
                    }

                    _this.stats.count('request-complete');

                    return res.body.read();
                });
            }).then(function (value) {
                d.resolve(value);
            }, d.reject);

            return d.promise;
        };

        Object.defineProperty(GithubRawCached.prototype, "service", {
            get: function () {
                return this._service;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(GithubRawCached.prototype, "loader", {
            get: function () {
                return this._loader;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(GithubRawCached.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (value) {
                this._debug = value;
                this.stats.log = value;
                this._loader.debug = value;
            },
            enumerable: true,
            configurable: true
        });

        return GithubRawCached;
    })();
    git.GithubRawCached = GithubRawCached;
})(git || (git = {}));
var tsd;
(function (tsd) {
    'use strict';

    var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;

    var leadingExp = /^\.\.\//;

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
                if (def.history.length > 0) {
                    return def.history[0];
                }
                return def.head;
            });
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
                return -1;
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
                return -1;
            }

            return -1;
        };
        return DefUtil;
    })();
    tsd.DefUtil = DefUtil;
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

    var subjectExp = /^(.*?)[ \t]*(?:[\r\n]+|$)/;

    var GitCommitMessage = (function () {
        function GitCommitMessage(text) {
            if (typeof text === "undefined") { text = null; }
            if (text) {
                this.parse(this.text);
            }
        }
        GitCommitMessage.prototype.parse = function (text) {
            this.text = String(text);

            subjectExp.lastIndex = 0;
            var match = subjectExp.exec(this.text);
            this.subject = (match && match.length > 1 ? match[1] : '');
            this.body = '';
            this.footer = '';
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

    var pointer = require('jsonpointer.js');
    var branch_tree_sha = '/commit/commit/tree/sha';

    var DefCommit = (function () {
        function DefCommit(commitSha) {
            this.hasMeta = false;
            this.message = new git.GitCommitMessage();
            xm.assertVar(commitSha, 'string', 'commitSha');

            this.commitSha = commitSha;

            xm.ObjectUtil.hidePrefixed(this);
            xm.ObjectUtil.lockProps(this, ['commitSha']);
        }
        DefCommit.prototype.parseJSON = function (commit) {
            xm.assertVar(commit, 'object', 'commit');
            xm.log('parseJSON');
            if (commit.sha !== this.commitSha) {
                throw new Error('not my tree: ' + this.commitSha + ' -> ' + commit.sha);
            }

            if (this.treeSha) {
                throw new Error('allready got tree: ' + this.treeSha + ' -> ' + commit.sha);
            }

            this.treeSha = pointer.get(commit, branch_tree_sha);
            xm.log(commit);
            xm.assertVar(this.treeSha, 'sha1', 'treeSha');

            this.hubAuthor = git.GithubUser.fromJSON(commit.author);
            this.hubCommitter = git.GithubUser.fromJSON(commit.committer);

            this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
            this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);

            this.message.parse(commit.commit.message);
            this.hasMeta = true;

            xm.ObjectUtil.lockProps(this, ['treeSha', 'hasMeta']);
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

    var pointer = require('jsonpointer.js');
    var commit_sha = '/commit/sha';

    var branch_tree_sha = '/commit/commit/tree/sha';

    var DefIndex = (function () {
        function DefIndex() {
            this._branchName = null;
            this._hasIndex = false;
            this._indexCommit = null;
            this._definitions = new xm.KeyValueMap();
            this._commits = new xm.KeyValueMap();
            this._blobs = new xm.KeyValueMap();
            this._versions = new xm.KeyValueMap();
            xm.ObjectUtil.hidePrefixed(this);
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
                commit.parseJSON(json);

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

        DefIndex.prototype.procureBlobFor = function (content, encoding) {
            if (typeof encoding === "undefined") { encoding = null; }
            xm.assertVar(content, Buffer, 'content');

            var sha = git.GitUtil.blobShaHex(content, encoding);
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
            return this._definitions.get(path, null);
        };

        DefIndex.prototype.hasDef = function (path) {
            return this._definitions.has(path);
        };

        DefIndex.prototype.getBlob = function (sha) {
            return this._blobs.get(sha, null);
        };

        DefIndex.prototype.hasBlob = function (sha) {
            return this._blobs.has(sha);
        };

        DefIndex.prototype.getCommit = function (sha) {
            return this._commits.get(sha, null);
        };

        DefIndex.prototype.hasCommit = function (sha) {
            return this._commits.has(sha);
        };

        DefIndex.prototype.getPaths = function () {
            return this._definitions.values().map(function (file) {
                return file.path;
            });
        };

        DefIndex.prototype.toDump = function () {
            var ret = [];
            ret.push(this.toString());
            var arr = this._definitions.values();
            arr.forEach(function (def) {
                ret.push('  ' + def.toString());
            });
            return ret.join('\n') + '\n' + 'total ' + arr.length + ' definitions';
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
                return this._definitions.values();
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
var xm;
(function (xm) {
    'use strict';

    var util = require('util');
    var trimmedLine = /([ \t]*)(.*?)([ \t]*)(\r\n|\n|\r|$)/g;

    var LineParserCore = (function () {
        function LineParserCore(verbose) {
            if (typeof verbose === "undefined") { verbose = false; }
            this.verbose = verbose;
            this.parsers = new xm.KeyValueMap();
        }
        LineParserCore.prototype.addParser = function (parser) {
            this.parsers.set(parser.id, parser);
        };

        LineParserCore.prototype.getInfo = function () {
            var ret = {};
            ret.parsers = this.parsers.keys().sort();
            return ret;
        };

        LineParserCore.prototype.getParser = function (id) {
            return this.parsers.get(id, null);
        };

        LineParserCore.prototype.link = function () {
            var _this = this;
            xm.eachElem(this.parsers.values(), function (parser) {
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
            return this.parsers.values();
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
                if (line.index + line[0].lengt === cursor) {
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
                xm.eachElem(res, function (match) {
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
var xm;
(function (xm) {
    'use strict';

    var endSlashTrim = /\/?$/;

    var AuthorInfo = (function () {
        function AuthorInfo(name, url, email) {
            if (typeof name === "undefined") { name = ''; }
            if (typeof url === "undefined") { url = null; }
            if (typeof email === "undefined") { email = null; }
            this.name = name;
            this.url = url;
            this.email = email;
            if (this.url) {
                this.url = this.url.replace(endSlashTrim, '');
            }
        }
        AuthorInfo.prototype.toString = function () {
            return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
        };

        AuthorInfo.prototype.toJSON = function () {
            var obj = { name: this.name };
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

    var identifierCap = /([\w\._-]*(?:[ \t]*[\w\._-]+)*?)/;
    var versionCap = /-?v?(\d+\.\d+\.?\d*\.?\d*)?/;
    var wordsCap = /([\w \t_-]+[\w]+)/;
    var labelCap = /([\w_-]+[\w]+)/;

    var delimStart = /[<\[\{\(]/;
    var delimStartOpt = /[<\[\{\(]?/;
    var delimEnd = /[\)\}\]>]/;
    var delimEndOpt = /[\)\}\]>]?/;

    var seperatorOpt = /[,;]?/;

    var urlGroupsCap = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;
    var urlFullCap = /((?:(?:[A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(?:(?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[.\!\/\\w]*))?)/;

    var referenceTag = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/;

    var commentStart = glue(expStart, spaceOpt, /\/\/+/, spaceOpt).join();
    var optUrl = glue('(?:', spaceOpt, delimStartOpt, urlFullCap, delimEndOpt, ')?').join();

    var commentLine = glue(commentStart).append(anyLazyCap).append(spaceOpt, expEnd).join();

    var referencePath = glue(expStart, spaceOpt, /\/\/+/, spaceOpt).append(referenceTag).append(spaceOpt, expEnd).join();

    var typeHead = glue(commentStart).append(/Type definitions?/, spaceOpt, /(?:for)?:?/, spaceOpt, identifierCap).append(/[ \t:-]+/, versionCap, spaceOpt).append(anyGreedy, expEnd).join('i');

    var projectUrl = glue(commentStart).append(/Project/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var defAuthorUrl = glue(commentStart).append(/Definitions[ \t]+by[ \t]*:?/, spaceOpt).append(wordsCap, optUrl).append(spaceOpt, seperatorOpt, spaceOpt, expEnd).join('i');

    var defAuthorUrlAlt = glue(commentStart).append(/Author[ \t]*:?/, spaceOpt).append(wordsCap, optUrl).append(spaceOpt, seperatorOpt, spaceOpt, expEnd).join('i');

    var reposUrl = glue(commentStart).append(/Definitions/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var reposUrlAlt = glue(commentStart).append(/DefinitelyTyped/, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var labelUrl = glue(commentStart).append(labelCap, spaceOpt, /:?/, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var labelWordsUrl = glue(commentStart).append(labelCap, spaceOpt, /:?/, spaceOpt).append(wordsCap, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    var wordsUrl = glue(commentStart).append(wordsCap, spaceOpt).append(delimStartOpt, urlFullCap, delimEndOpt).append(spaceOpt, expEnd).join('i');

    function mutate(base, add, remove) {
        var res = base ? base.slice(0) : [];
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

            var fields = ['projectUrl', 'defAuthorUrl', 'defAuthorUrlAlt', 'reposUrl', 'reposUrlAlt', 'referencePath'];

            this.parser.addParser(new xm.LineParser('any', anyGreedyCap, 0, null, ['head', 'any']));

            this.parser.addParser(new xm.LineParser('head', typeHead, 2, function (match) {
                data.name = match.getGroup(0, data.name);
                data.version = match.getGroup(1, data.version);
            }, fields));

            fields = mutate(fields, null, ['projectUrl']);

            this.parser.addParser(new xm.LineParser('projectUrl', projectUrl, 1, function (match) {
                data.projectUrl = match.getGroup(0, data.projectUrl).replace(endSlashTrim, '');
            }, fields));

            fields = mutate(fields, ['defAuthorAppend'], ['defAuthorUrl', 'defAuthorUrlAlt']);

            this.parser.addParser(new xm.LineParser('defAuthorUrl', defAuthorUrl, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));

            this.parser.addParser(new xm.LineParser('defAuthorUrlAlt', defAuthorUrlAlt, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));

            this.parser.addParser(new xm.LineParser('defAuthorAppend', wordsUrl, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));

            fields = mutate(fields, null, ['defAuthorAppend']);
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

    var leadingExp = /^\.\.\//;

    var Resolver = (function () {
        function Resolver(core) {
            this._active = new xm.KeyValueMap();
            this.stats = new xm.StatCounter();
            xm.assertVar(core, tsd.Core, 'core');
            this._core = core;

            this.stats.log = this._core.context.verbose;
            this.stats.logger = xm.getLogger('Resolver');

            xm.ObjectUtil.hidePrefixed(this);
        }
        Resolver.prototype.resolveBulk = function (list) {
            var _this = this;
            var d = Q.defer();
            this.stats.count('solve-bulk-start');

            list = tsd.DefUtil.uniqueDefVersion(list);

            Q.all(list.map(function (file) {
                return _this.resolveDeps(file);
            })).then(function () {
                _this.stats.count('solve-bulk-success');
                d.resolve(list);
            }, function (err) {
                _this.stats.count('solve-bulk-error');
                d.reject(err);
            });

            return d.promise;
        };

        Resolver.prototype.resolveDeps = function (file) {
            var _this = this;
            var d = Q.defer();

            if (file.solved) {
                this.stats.count('solved-already');
                d.resolve(file);
                return d.promise;
            }

            if (this._active.has(file.key)) {
                this.stats.count('active-has');

                this._active.get(file.key).done(function () {
                    d.resolve(file);
                }, d.reject);
                return d.promise;
            } else {
                this.stats.count('active-miss');
            }

            var cleanup = function () {
                _this._active.remove(file.key);
                _this.stats.count('active-remove');
            };

            this._core.loadContent(file).then(function (file) {
                _this.stats.count('file-parse');

                file.dependencies.splice(0, file.dependencies.length);

                var refs = tsd.DefUtil.extractReferenceTags(file.blob.content.toString('utf8'));

                refs = refs.reduce(function (memo, refPath) {
                    refPath = refPath.replace(leadingExp, '');

                    if (refPath.indexOf('/') < 0) {
                        refPath = file.def.project + '/' + refPath;
                    }
                    if (tsd.Def.isDefPath(refPath)) {
                        memo.push(refPath);
                    } else {
                        xm.log.warn('not a usable reference: ' + refPath);
                    }
                    return memo;
                }, []);

                var queued = refs.reduce(function (memo, refPath) {
                    if (_this._core.index.hasDef(refPath)) {
                        var dep = _this._core.index.getDef(refPath);
                        file.dependencies.push(dep);
                        _this.stats.count('dep-added');

                        if (!dep.head.solved && !_this._active.has(dep.head.key)) {
                            _this.stats.count('dep-recurse');

                            memo.push(_this.resolveDeps(dep.head));
                        }
                    } else {
                        xm.log.warn('path reference not in index: ' + refPath);
                    }
                    return memo;
                }, []);

                file.solved = true;

                if (queued.length > 0) {
                    _this.stats.count('subload-start');
                    return Q.all(queued);
                } else {
                    _this.stats.count('subload-none');
                }
            }).then(function () {
                cleanup();
                d.resolve(file);
            }, function (err) {
                cleanup();
                d.reject(err);
            });

            this.stats.count('active-set');
            this._active.set(file.key, d.promise);

            return d.promise;
        };
        return Resolver;
    })();
    tsd.Resolver = Resolver;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var Q = require('q');
    var FS = require('q-io/fs');
    var path = require('path');
    var pointer = require('jsonpointer.js');

    var branch_tree = '/commit/commit/tree/sha';

    var leadingExp = /^\.\.\//;

    var Core = (function () {
        function Core(context) {
            this.context = context;
            this.stats = new xm.StatCounter();
            this.log = xm.getLogger('Core');
            this._debug = false;
            xm.assertVar(context, tsd.Context, 'context');

            this.resolver = new tsd.Resolver(this);
            this.index = new tsd.DefIndex();

            this.gitRepo = new git.GithubRepo(this.context.config.repoOwner, this.context.config.repoProject);
            this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git-api'));
            this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git-raw'));

            this.gitRaw.headers['User-Agent'] = this.context.packageInfo.getNameVersion();

            this.stats.logger = xm.getLogger('Core.stats');

            this.debug = context.verbose;

            xm.ObjectUtil.hidePrefixed(this);
        }
        Core.prototype.getInstallPath = function (def) {
            return path.join(this.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
        };

        Core.prototype.updateIndex = function () {
            var _this = this;
            var d = Q.defer();

            this.stats.count('index-start');
            if (this.index.hasIndex()) {
                this.stats.count('index-hit');

                d.resolve(null);
                return d.promise;
            }
            this.stats.count('index-miss');

            this.stats.count('index-branch-get');

            this.gitAPI.getBranch(this.context.config.ref).then(function (branchData) {
                var sha = pointer.get(branchData, branch_tree);
                if (!sha) {
                    _this.stats.count('index-branch-get-fail');
                    throw new Error('missing sha hash');
                }
                _this.stats.count('index-branch-get-success');
                _this.stats.count('index-tree-get');

                return _this.gitAPI.getTree(sha, true).then(function (data) {
                    _this.stats.count('index-tree-get-success');

                    _this.index.init(branchData, data);

                    _this.stats.count('index-success');
                    d.resolve(null);
                }, function (err) {
                    _this.stats.count('index-tree-get-error');
                    d.reject(err);
                });
            }).fail(function (err) {
                _this.stats.count('index-branch-get-error');
                d.reject(err);
            });

            return d.promise;
        };

        Core.prototype.select = function (selector) {
            var _this = this;
            var d = Q.defer();

            var res = new tsd.APIResult(this.index, selector);
            this.updateIndex().then(function () {
                res.nameMatches = selector.pattern.filter(_this.index.list);

                res.selection = tsd.DefUtil.getHeads(res.nameMatches);

                if (selector.resolveDependencies) {
                    return _this.resolveDepencendiesBulk(res.selection);
                }
            }).then(function () {
                d.resolve(res);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.procureDef = function (path) {
            var _this = this;
            var d = Q.defer();

            this.updateIndex().then(function () {
                var def = _this.index.procureDef(path);
                if (!def) {
                    d.reject('cannot get def for path: ' + path);
                    return;
                }
                d.resolve(def);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.procureFile = function (path, commitSha) {
            var _this = this;
            var d = Q.defer();

            this.updateIndex().then(function () {
                var file = _this.index.procureVersionFromSha(path, commitSha);
                if (!file) {
                    d.reject('cannot get file for path: ' + path);
                    return;
                }
                d.resolve(file);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.procureCommit = function (commitSha) {
            var _this = this;
            var d = Q.defer();

            this.updateIndex().then(function () {
                var commit = _this.index.procureCommit(commitSha);
                if (!commit) {
                    d.reject('cannot commit def for commitSha: ' + path);
                    return;
                }
                d.resolve(commit);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.findFile = function (path, commitShaFragment) {
            var d = Q.defer();

            d.reject('implement me!');
            return d.promise;
        };

        Core.prototype.installFile = function (file, addToConfig, overwrite) {
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            if (typeof overwrite === "undefined") { overwrite = false; }
            var _this = this;
            var d = Q.defer();

            this.useFile(file, overwrite).then(function (targetPath) {
                if (_this.context.config.hasFile(file.def.path)) {
                    _this.context.config.getFile(file.def.path).update(file);
                } else if (addToConfig) {
                    _this.context.config.addFile(file);
                }
                d.resolve(targetPath);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.installFileBulk = function (list, addToConfig, overwrite) {
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            if (typeof overwrite === "undefined") { overwrite = true; }
            var _this = this;
            var d = Q.defer();

            var written = new xm.KeyValueMap();

            Q.all(list.map(function (file) {
                return _this.installFile(file, addToConfig, overwrite).then(function (targetPath) {
                    if (targetPath) {
                        written.set(file.def.path, file);
                    }
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.readConfig = function (optional) {
            if (typeof optional === "undefined") { optional = false; }
            var _this = this;
            var d = Q.defer();

            FS.exists(this.context.paths.configFile).then(function (exists) {
                if (!exists) {
                    if (!optional) {
                        d.reject(new Error('cannot locate file: ' + _this.context.paths.configFile));
                    } else {
                        d.resolve(null);
                    }
                } else {
                    return xm.FileUtil.readJSONPromise(_this.context.paths.configFile).then(function (json) {
                        _this.context.config.parseJSON(json);
                        d.resolve(null);
                    });
                }
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.saveConfig = function () {
            var d = Q.defer();

            var target = this.context.paths.configFile;
            var json = JSON.stringify(this.context.config.toJSON(), null, 2);
            var dir = path.dirname(target);

            if (!json || json.length === 0) {
                return Q.reject(new Error('saveConfig retrieved empty json'));
            }

            xm.FileUtil.mkdirCheckQ(dir, true).then(function () {
                return FS.write(target, json).then(function () {
                    return FS.stat(target);
                }).then(function () {
                    return Q.delay(100);
                }).then(function () {
                    return FS.stat(target).then(function (stat) {
                        if (stat.size === 0) {
                            throw new Error('saveConfig write zero bytes to: ' + target);
                        }
                    });
                });
            }).then(function () {
                d.resolve(target);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.reinstallBulk = function (list, overwrite) {
            if (typeof overwrite === "undefined") { overwrite = false; }
            var _this = this;
            var d = Q.defer();

            var written = new xm.KeyValueMap();

            Q.all(list.map(function (installed) {
                return _this.procureFile(installed.path, installed.commitSha).then(function (file) {
                    return _this.installFile(file, overwrite).then(function (targetPath) {
                        written.set(file.def.path, file);
                        return file;
                    });
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.loadCommitMetaData = function (commit) {
            var d = Q.defer();

            if (commit.hasMetaData()) {
                return Q(commit);
            }
            this.gitAPI.getCommit(commit.commitSha).then(function (json) {
                commit.parseJSON(json);
                d.resolve(commit);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.loadContent = function (file) {
            var _this = this;
            var d = Q.defer();

            if (file.hasContent()) {
                return Q(file);
            }

            this.gitRaw.getFile(file.commit.commitSha, file.def.path).then(function (content) {
                if (file.blob) {
                    if (!file.blob.hasContent()) {
                        try  {
                            file.blob.setContent(content);
                        } catch (err) {
                            xm.log.warn(err);
                            xm.log.debug('path', file.def.path);
                            xm.log.debug('commitSha', file.commit.commitSha);
                            xm.log.debug('treeSha', file.commit.treeSha);
                            xm.log.error('failed to set content');

                            throw err;
                        }
                    }
                } else {
                    file.setContent(_this.index.procureBlobFor(content));
                }
                d.resolve(file);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.loadContentBulk = function (list) {
            var _this = this;
            var d = Q.defer();

            Q.all(list.map(function (file) {
                return _this.loadContent(file);
            })).then(function (list) {
                d.resolve(list);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.loadHistory = function (def) {
            var _this = this;
            var d = Q.defer();

            if (def.history.length > 0) {
                return Q(def);
            }
            this.gitAPI.getPathCommits(this.context.config.ref, def.path).then(function (content) {
                _this.index.setHistory(def, content);

                d.resolve(def);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.loadHistoryBulk = function (list) {
            var _this = this;
            var d = Q.defer();

            list = tsd.DefUtil.uniqueDefs(list);

            Q.all(list.map(function (file) {
                return _this.loadHistory(file);
            })).then(function (list) {
                d.resolve(list);
            }, d.reject);

            return d.promise;
        };

        Core.prototype.resolveDepencendies = function (file) {
            return this.resolver.resolveDeps(file);
        };

        Core.prototype.resolveDepencendiesBulk = function (list) {
            return this.resolver.resolveBulk(list);
        };

        Core.prototype.parseDefInfo = function (file) {
            var _this = this;
            var d = Q.defer();

            this.loadContent(file).then(function (file) {
                var parser = new tsd.DefInfoParser(_this.context.verbose);
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

        Core.prototype.parseDefInfoBulk = function (list) {
            var _this = this;
            var d = Q.defer();

            list = tsd.DefUtil.uniqueDefVersion(list);

            Q.all(list.map(function (file) {
                return _this.parseDefInfo(file);
            })).then(function (list) {
                d.resolve(list);
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.useFile = function (file, overwrite) {
            var _this = this;
            var d = Q.defer();

            var targetPath = this.getInstallPath(file.def);

            xm.FileUtil.canWriteFile(targetPath, overwrite).then(function (canWrite) {
                if (!canWrite) {
                    xm.log.out.warning('skipped existing file: ' + file.def.path).line();
                    d.resolve(null);
                    return;
                }

                return _this.loadContent(file).then(function () {
                    return FS.exists(targetPath);
                }).then(function (exists) {
                    if (exists) {
                        return FS.remove(targetPath);
                    }
                    return xm.FileUtil.mkdirCheckQ(path.dirname(targetPath), true);
                }).then(function () {
                    return FS.write(targetPath, file.blob.content);
                }).then(function () {
                    d.resolve(targetPath);
                });
            }).fail(d.reject);

            return d.promise;
        };

        Core.prototype.useFileBulk = function (list, overwrite) {
            if (typeof overwrite === "undefined") { overwrite = true; }
            var _this = this;
            var d = Q.defer();

            list = tsd.DefUtil.uniqueDefVersion(list);

            var written = new xm.KeyValueMap();

            Q.all(list.map(function (file) {
                return _this.useFile(file, overwrite).then(function (targetPath) {
                    written.set(file.def.path, file);
                });
            })).then(function () {
                d.resolve(written);
            }, d.reject);

            return d.promise;
        };

        Object.defineProperty(Core.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (value) {
                this._debug = value;
                this.gitAPI.debug = this._debug;
                this.gitRaw.debug = this._debug;

                this.stats.log = this._debug;
                this.resolver.stats.log = this._debug;
            },
            enumerable: true,
            configurable: true
        });

        return Core;
    })();
    tsd.Core = Core;
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');
    var util = require('util');
    var Q = require('q');
    var FS = require('q-io/fs');

    var APIResult = (function () {
        function APIResult(index, selector) {
            if (typeof selector === "undefined") { selector = null; }
            this.index = index;
            this.selector = selector;
            this.written = new xm.KeyValueMap();
            xm.assertVar(index, tsd.DefIndex, 'index');
            xm.assertVar(selector, tsd.Selector, 'selector', true);
        }
        return APIResult;
    })();
    tsd.APIResult = APIResult;
    var APIMessage = (function () {
        function APIMessage(message, tag) {
            this.message = message;
            this.tag = tag;
        }
        APIMessage.prototype.toString = function () {
            return this.tag + ':' + this.message;
        };
        return APIMessage;
    })();
    tsd.APIMessage = APIMessage;

    var APIProgress = (function (_super) {
        __extends(APIProgress, _super);
        function APIProgress(message, code, total, current) {
            if (typeof total === "undefined") { total = 0; }
            if (typeof current === "undefined") { current = 0; }
            _super.call(this, message, code);
            this.total = total;
            this.current = current;
        }
        APIProgress.prototype.getRatio = function () {
            if (this.total > 0) {
                return Math.min(Math.max(0, this.current), this.total) / this.total;
            }
            return 0;
        };

        APIProgress.prototype.getPerc = function () {
            return Math.round(this.getRatio() * 100) + '%';
        };

        APIProgress.prototype.getOf = function () {
            return this.current + '/' + this.total;
        };

        APIProgress.prototype.toString = function () {
            return _super.prototype.toString.call(this) + ':';
        };
        return APIProgress;
    })(APIMessage);
    tsd.APIProgress = APIProgress;

    var API = (function () {
        function API(context) {
            this.context = context;
            this._debug = false;
            xm.assertVar(context, tsd.Context, 'context');

            this._core = new tsd.Core(this.context);

            xm.ObjectUtil.hidePrefixed(this);
        }
        API.prototype.readConfig = function (optional) {
            var d = Q.defer();

            this._core.readConfig(optional).then(function () {
                d.resolve(undefined);
            }, d.reject);

            return d.promise;
        };

        API.prototype.saveConfig = function () {
            var d = Q.defer();

            this._core.saveConfig().then(function () {
                d.resolve(undefined);
            }, d.reject);

            return d.promise;
        };

        API.prototype.search = function (selector) {
            xm.assertVar(selector, tsd.Selector, 'selector');
            var d = Q.defer();

            this._core.select(selector).then(d.resolve, d.reject);

            return d.promise;
        };

        API.prototype.install = function (selector) {
            var _this = this;
            xm.assertVar(selector, tsd.Selector, 'selector');
            var d = Q.defer();

            this._core.select(selector).then(function (res) {
                var files = res.selection;

                files = tsd.DefUtil.mergeDependencies(files);

                return _this._core.installFileBulk(files, selector.saveToConfig, selector.overwriteFiles).then(function (written) {
                    if (!written) {
                        throw new Error('expected install paths');
                    }
                    res.written = written;

                    if (selector.saveToConfig) {
                        return _this._core.saveConfig().then(function () {
                            d.resolve(res);
                        });
                    }
                    d.resolve(res);
                });
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.directInstall = function (path, commitSha) {
            xm.assertVar(path, 'string', 'path');
            xm.assertVar(commitSha, 'sha1', 'commitSha');
            var d = Q.defer();

            var res = new tsd.APIResult(this._core.index, null);

            this._core.procureFile(path, commitSha).then(function (file) {
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.installFragment = function (path, commitShaFragment) {
            var _this = this;
            xm.assertVar(path, 'string', 'path');
            var d = Q.defer();

            var res = new tsd.APIResult(this._core.index, null);

            this._core.findFile(path, commitShaFragment).then(function (file) {
                return _this._core.installFile(file).then(function (targetPath) {
                    res.written.set(targetPath, file);
                    d.resolve(res);
                });
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.info = function (selector) {
            var _this = this;
            xm.assertVar(selector, tsd.Selector, 'selector');
            var d = Q.defer();

            this._core.select(selector).then(function (res) {
                return _this._core.parseDefInfoBulk(res.selection).then(function () {
                    d.resolve(res);
                });
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.history = function (selector) {
            var _this = this;
            xm.assertVar(selector, tsd.Selector, 'selector');
            var d = Q.defer();

            this._core.select(selector).then(function (res) {
                res.definitions = tsd.DefUtil.getDefs(res.selection);

                return _this._core.loadHistoryBulk(res.definitions).then(function () {
                    d.resolve(res);
                });
            }).fail(d.reject);

            return d.promise;
        };

        API.prototype.reinstall = function (overwrite) {
            if (typeof overwrite === "undefined") { overwrite = false; }
            var res = new tsd.APIResult(this._core.index, null);
            var d = Q.defer();

            this._core.reinstallBulk(this.context.config.getInstalled(), overwrite).then(function (map) {
                res.written = map;
            }).then(function () {
                d.resolve(res);
            }, d.reject);

            return d.promise;
        };

        API.prototype.compare = function (selector) {
            xm.assertVar(selector, tsd.Selector, 'selector');
            var d = Q.defer();
            d.reject(new Error('not implemented yet'));

            return d.promise;
        };

        API.prototype.purge = function () {
            var d = Q.defer();
            d.reject(new Error('not implemented yet'));

            return d.promise;
        };

        Object.defineProperty(API.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (value) {
                this._debug = value;
                this._core.debug = this._debug;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(API.prototype, "core", {
            get: function () {
                return this._core;
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

    var optimist = require('optimist');
    var jsesc = require('jsesc');
    var Q = require('q');
    var exitProcess = require('exit');

    var Table = require('easy-table');

    xm.converStringMap = Object.create(null);

    var splitSV = /[\t ]*[,][\t ]*/g;

    xm.converStringMap.number = function (input) {
        var num = parseFloat(input);
        if (isNaN(num)) {
            throw new Error('input is NaN and not float');
        }
        return num;
    };
    xm.converStringMap.int = function (input) {
        var num = parseInt(input, 10);
        if (isNaN(num)) {
            throw new Error('input is NaN and not integer');
        }
        return num;
    };
    xm.converStringMap.boolean = function (input) {
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
    xm.converStringMap.flag = function (input) {
        if (xm.isUndefined(input) || input === '') {
            return true;
        }
        return xm.converStringMap.boolean(input);
    };
    xm.converStringMap['number[]'] = function (input) {
        return input.split(splitSV).map(function (value) {
            return xm.converStringMap.number(value);
        });
    };
    xm.converStringMap['int[]'] = function (input) {
        return input.split(splitSV).map(function (value) {
            return xm.converStringMap.int(value);
        });
    };
    xm.converStringMap['string[]'] = function (input) {
        return input.split(splitSV);
    };
    xm.converStringMap.json = function (input) {
        return JSON.parse(input);
    };

    function convertStringTo(input, type) {
        if (xm.hasOwnProp(xm.converStringMap, type)) {
            return xm.converStringMap[type](input);
        }
        return input;
    }
    xm.convertStringTo = convertStringTo;

    var ExposeContext = (function () {
        function ExposeContext(expose, argv, command) {
            this.expose = expose;
            this.command = command;
            this.argv = argv;
            this.out = this.expose.output;
        }
        ExposeContext.prototype.hasArg = function (name) {
            return xm.hasOwnProp(this.argv, name);
        };

        ExposeContext.prototype.getArgRaw = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                return this.argv[name];
            }
            return alt;
        };

        ExposeContext.prototype.getArg = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                if (this.expose.options.has(name)) {
                    var option = this.expose.options.get(name);
                    if (option.type) {
                        return xm.convertStringTo(this.argv[name], option.type);
                    }
                }
                return this.argv[name];
            }
            return alt;
        };

        ExposeContext.prototype.getArgAs = function (name, type, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                return xm.convertStringTo(this.argv[name], type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgAt = function (index, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return this.argv._[index];
            }
            return alt;
        };

        ExposeContext.prototype.getArgAtAs = function (index, type, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return xm.convertStringTo(this.argv._[index], type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgsAs = function (type) {
            return this.argv._.map(function (value) {
                return xm.convertStringTo(value, type);
            });
        };

        ExposeContext.prototype.getArgNames = function () {
            return Object.keys(this.argv).filter(function (name) {
                return (name !== '_');
            });
        };

        ExposeContext.prototype.getEnum = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                if (this.expose.options.has(name)) {
                    var option = this.expose.options.get(name);
                    var value = this.getArg(name);
                    if (option.enum.indexOf(value) > -1) {
                        return value;
                    }
                }
            }
            return alt;
        };

        ExposeContext.prototype.shiftArg = function (alt) {
            if (this.argv._.length > 0) {
                return this.argv._.shift();
            }
            return alt;
        };

        ExposeContext.prototype.shiftArgAs = function (type, alt) {
            if (this.argv._.length > 0) {
                return xm.convertStringTo(this.argv._.shift(), type);
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

    var ExposeCommand = (function () {
        function ExposeCommand() {
            this.options = [];
            this.variadic = [];
            this.groups = [];
            this.note = [];
        }
        return ExposeCommand;
    })();
    xm.ExposeCommand = ExposeCommand;

    var ExposeGroup = (function () {
        function ExposeGroup() {
            this.sorter = exposeSortIndex;
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
        function Expose(title, output) {
            if (typeof title === "undefined") { title = ''; }
            if (typeof output === "undefined") { output = null; }
            var _this = this;
            this.title = title;
            this.commands = new xm.KeyValueMap();
            this.options = new xm.KeyValueMap();
            this.groups = new xm.KeyValueMap();
            this.mainGroup = new ExposeGroup();
            this._isInit = false;
            this._index = 0;
            this.output = (output || new xm.StyledOut());

            this.defineCommand(function (cmd) {
                cmd.name = 'help';
                cmd.label = 'Display usage help';
                cmd.groups = ['help'];
                cmd.execute = function (ctx) {
                    _this.printCommands();
                    return null;
                };
            });

            this.defineOption(function (opt) {
                opt.name = 'help';
                opt.short = 'h';
                opt.description = 'Display usage help';
                opt.type = 'flag';
                opt.command = 'help';
                opt.global = true;
            });

            xm.ObjectUtil.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
                writable: false,
                enumerable: false
            });
        }
        Expose.prototype.defineOption = function (build) {
            var opt = new ExposeOption();
            build(opt);

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
            argv = optimist.parse(argv);
            var ctx = new ExposeContext(this, argv, null);

            Object.keys(argv).forEach(function (name) {
                if (name !== '_' && _this.options.has(name)) {
                    var opt = _this.options.get(name);
                    if (opt.apply) {
                        opt.apply(ctx.getArg(name), argv);
                    }
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

            xm.eachProp(this.options.keys(), function (name) {
                var option = _this.options.get(name);
                if (option.short) {
                    optimist.alias(option.name, option.short);
                }
                if (xm.ObjectUtil.hasOwnProp(option, 'default')) {
                    optimist.default(option.name, option.default);
                }
            });
        };

        Expose.prototype.exit = function (code) {
            if (code !== 0) {
                this.output.line().error('Closing with exit code ' + code).clear();
            } else {
                this.output.line().ok('bye!');
            }
            exitProcess(code);
        };

        Expose.prototype.executeArgv = function (argvRaw, alt, exitAfter) {
            if (typeof exitAfter === "undefined") { exitAfter = true; }
            var _this = this;
            Q(this.executeRaw(argvRaw, alt).then(function (result) {
                if (result.error) {
                    throw (result.error);
                }
                if (exitAfter) {
                    _this.exit(result.code);
                }
            }).fail(function (err) {
                if (err.stack) {
                    _this.output.span(err.stack).clear();
                } else {
                    _this.output.error(err.toString()).clear();
                }
                _this.exit(1);
            }));
        };

        Expose.prototype.executeRaw = function (argvRaw, alt) {
            this.init();

            if (!alt || !this.commands.has(alt)) {
                alt = 'help';
            }

            var options = this.options.values();
            var opt;
            var i, ii;

            var ctx = this.applyOptions(argvRaw);
            if (!ctx) {
                return this.executeCommand(alt);
            }

            for (i = 0, ii = options.length; i < ii; i++) {
                opt = options[i];
                if (opt.command && ctx.hasArg(opt.name)) {
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
                this.output.line().warning('command not found: ' + cmd).clear();
                return this.executeCommand('help', ctx);
            }
        };

        Expose.prototype.executeCommand = function (name, ctx) {
            if (typeof ctx === "undefined") { ctx = null; }
            var _this = this;
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
                    return Q(_this.before(cmd, ctx));
                }
                return null;
            }).then(function () {
                return Q(cmd.execute(ctx));
            }).then(function () {
                if (_this.after) {
                    return Q(_this.after(cmd, ctx));
                }
                return null;
            }).then(function () {
                return {
                    code: 0,
                    ctx: ctx
                };
            }, function (err) {
                return {
                    code: (err.code && err.code > 0) ? err.code : 1,
                    error: err,
                    ctx: ctx
                };
            }).done(function (ret) {
                defer.resolve(ret);
            });

            return defer.promise;
        };

        Expose.prototype.printCommands = function () {
            var _this = this;
            if (this.title) {
                this.output.accent(this.title).clear();
            }

            var optionString = function (option) {
                var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
                return '--' + option.name + placeholder;
            };

            var commands = new Table();

            var commandOptNames = [];
            var globalOptNames = [];
            var commandPadding = '   ';
            var optPadding = '      ';
            var optPaddingHalf = ' : ';

            var sortOptionName = function (one, two) {
                return exposeSortOption(_this.options.get(one), _this.options.get(two));
            };

            var optKeys = this.options.keys().sort(sortOptionName);

            var addHeader = function (label) {
                commands.cell('one', label);
                commands.newRow();
                addDivider();
            };

            var addDivider = function () {
                commands.cell('one', '--------');
                commands.cell('short', '----');
                commands.cell('two', '--------');
                commands.newRow();
            };

            var addOption = function (name) {
                var option = _this.options.get(name, null);
                if (!option) {
                    commands.cell('one', optPadding + '--' + name);
                    commands.cell('two', optPaddingHalf + '<undefined>');
                } else {
                    commands.cell('one', optPadding + optionString(option));
                    if (option.short) {
                        commands.cell('short', ' -' + option.short);
                    }
                    var desc = optPaddingHalf + option.description;
                    desc += ' (' + option.type;
                    desc += (option.default ? ', default: ' + option.default : '');
                    desc += ')';
                    commands.cell('two', desc);

                    if (option.enum.length > 0) {
                        commands.cell('two', '   ' + option.enum.map(function (value) {
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
                        }).join(','));
                    }
                }
                commands.newRow();

                addNote(option.note);
            };

            var addCommand = function (cmd, group) {
                var usage = cmd.name;
                if (cmd.variadic.length > 0) {
                    usage += ' <' + cmd.variadic.join(', ') + '>';
                }
                commands.cell('one', commandPadding + usage);
                commands.cell('two', cmd.label);
                commands.newRow();

                addNote(cmd.note);

                cmd.options.sort(sortOptionName).forEach(function (name) {
                    var option = _this.options.get(name);
                    if (commandOptNames.indexOf(name) < 0 && group.options.indexOf(name) < 0) {
                        addOption(name);
                    }
                });
            };

            var addNote = function (note) {
                if (note && note.length > 0) {
                    commands.cell('one', '');
                    commands.cell('two', '   <' + (xm.isArray(note) ? note.join('>/n<') : note) + '>');
                    commands.newRow();
                }
            };

            var allCommands = this.commands.keys();
            var allGroups = this.groups.values();

            optKeys.forEach(function (name) {
                var option = _this.options.get(name);
                if (option.command) {
                    commandOptNames.push(option.name);
                }
            });

            optKeys.forEach(function (name) {
                var option = _this.options.get(name);
                if (option.global && !option.command) {
                    globalOptNames.push(option.name);
                }
            });

            if (allGroups.length > 0) {
                this.groups.values().sort(exposeSortGroup).forEach(function (group) {
                    addHeader(group.label);

                    _this.commands.values().filter(function (cmd) {
                        return cmd.groups.indexOf(group.name) > -1;
                    }).sort(group.sorter).forEach(function (cmd) {
                        addCommand(cmd, group);

                        var i = allCommands.indexOf(cmd.name);
                        if (i > -1) {
                            allCommands.splice(i, 1);
                        }
                    });

                    if (group.options.length > 0) {
                        addDivider();
                        group.options.sort(sortOptionName).forEach(function (name) {
                            var option = _this.options.get(name);
                            if (commandOptNames.indexOf(name) < 0) {
                                addOption(name);
                            }
                        });
                    }
                    commands.newRow();
                });
            }

            if (allCommands.length > 0) {
                addHeader('Other commands');

                allCommands.forEach(function (name) {
                    addCommand(_this.commands.get(name), _this.mainGroup);
                });
                commands.newRow();
            }

            if (commandOptNames.length > 0 && globalOptNames.length > 0) {
                addHeader('Global options');

                if (commandOptNames.length > 0) {
                    xm.eachElem(commandOptNames, function (name) {
                        addOption(name);
                    });
                }

                if (globalOptNames.length > 0) {
                    xm.eachElem(globalOptNames, function (name) {
                        addOption(name);
                    });
                }
                commands.newRow();
            }

            this.output.block(commands.print().replace(/\s*$/, ''));
        };
        return Expose;
    })();
    xm.Expose = Expose;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function pad(number) {
        var r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    (function (DateUtil) {
        function toNiceUTC(date) {
            return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate()) + ' ' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes());
        }
        DateUtil.toNiceUTC = toNiceUTC;
    })(xm.DateUtil || (xm.DateUtil = {}));
    var DateUtil = xm.DateUtil;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    'use strict';

    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');

    var output = new xm.StyledOut();

    var styleMap = new xm.KeyValueMap();

    styleMap.set('no', function (ctx) {
        output.useStyler(new xm.styler.NoStyler());
    });
    styleMap.set('plain', function (ctx) {
        output.useStyler(new xm.styler.PlainStyler());
    });
    styleMap.set('ansi', function (ctx) {
        output.useStyler(new xm.styler.ANSIStyler());
    });
    styleMap.set('html', function (ctx) {
        output.useStyler(new xm.styler.HTMLWrapStyler());
    });
    styleMap.set('css', function (ctx) {
        output.useStyler(new xm.styler.CSSStyler());
    });
    styleMap.set('dev', function (ctx) {
        output.useStyler(new xm.styler.DevStyler());
    });

    function useColor(color, ctx) {
        if (styleMap.has(color)) {
            styleMap.get(color)(ctx);
        } else {
            styleMap.get('no')(ctx);
        }
    }

    function printPreviewNotice() {
        var pkg = xm.PackageJSON.getLocal();

        output.line().span('->').space().span(pkg.getNameVersion()).space().accent('(preview)').line().ruler().line();

        return Q.resolve();
    }

    var pleonasm;
    var pleonasmPromise;

    function loadPleonasm() {
        if (pleonasmPromise) {
            return pleonasmPromise;
        }

        return Q.resolve();
    }

    function pleo(input) {
        input = input.substring(0, 6);
        if (pleonasm) {
            return '\'' + pleonasm.encode(input, '_', '_').code + '\'';
        } else {
            return input;
        }
    }

    function getContext(ctx) {
        xm.assertVar(ctx, xm.ExposeContext, 'ctx');

        var context = new tsd.Context(ctx.getArg('config'), ctx.getArg('verbose'));

        if (ctx.getArg('dev')) {
            context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
        } else if (ctx.hasArg('cacheDir')) {
            context.paths.cacheDir = path.resolve(ctx.getArg('cacheDir'));
        } else {
            context.paths.cacheDir = tsd.Paths.getUserCacheDir();
        }
        return context;
    }

    function reportError(err) {
        output.error('-> ' + 'an error occured!').clear();

        if (err.stack) {
            output.block(err.stack);
        } else {
            output.line(err);
        }
    }

    function reportProgress(obj) {
        output.accent('progress').space().inspect(obj, 3);
    }

    function reportSucces(result) {
        if (result) {
            result.selection.forEach(function (def) {
                output.line(def.toString());
                if (def.info) {
                    output.line(def.info.toString());
                    output.line(def.info);
                }
            });
        }
    }

    function printSubHead(text) {
        output.line(' ' + text);
        output.ruler2();
    }

    function printDefHead(def) {
        output.line(def.toString() + ' ' + pleo(def.head.blob.shaShort));
        output.ruler2();
    }

    function printFileHead(file) {
        printFile(file);
        output.ruler2();
    }

    function printFile(file) {
        var str = '';
        str += (file.def ? file.def.path : '<no def>');
        str += '  :  ' + (file.commit ? file.commit.commitShort : '<no commit>');
        str += '  :  ' + (file.blob ? file.blob.shaShort : '<no blob>');
        output.line(str);
    }

    function printFileCommit(file, skipNull) {
        if (typeof skipNull === "undefined") { skipNull = false; }
        if (file.commit) {
            var line = '   ' + file.commit.commitShort;

            line += '  |  ' + file.blobShaShort;

            line += '  |  ' + xm.DateUtil.toNiceUTC(file.commit.gitAuthor.date);
            line += '  |  ' + file.commit.gitAuthor.name;
            if (file.commit.hubAuthor) {
                line += '  @  ' + file.commit.hubAuthor.login;
            }
            output.line(line);

            output.line();
            output.line('   ' + file.commit.message.subject);
            output.ruler2();
        } else if (!skipNull) {
            output.line('   ' + '<no commmit>');
            output.ruler2();
        }
    }

    function printFileInfo(file, skipNull) {
        if (typeof skipNull === "undefined") { skipNull = false; }
        if (file.info) {
            if (file.info.isValid()) {
                output.line('   ' + file.info.toString());
                output.line('      ' + file.info.projectUrl);
                file.info.authors.forEach(function (author) {
                    output.line('      ' + author.toString());
                });
                output.ruler2();
            } else {
                output.line('   ' + '<invalid info>');
                output.ruler2();
            }
        } else if (!skipNull) {
            output.line('   ' + '<no info>');
            output.ruler2();
        }
    }

    function printDependencies(file) {
        if (file.dependencies.length > 0) {
            tsd.DefUtil.mergeDependenciesOf(file.dependencies).filter(function (refer) {
                return refer.def.path !== file.def.path;
            }).sort(tsd.DefUtil.fileCompare).forEach(function (refer) {
                output.line(' - ' + refer.toString());

                if (refer.dependencies.length > 0) {
                    refer.dependencies.sort(tsd.DefUtil.defCompare).forEach(function (refer) {
                        output.line('    - ' + refer.path);
                    });
                }
            });
            output.ruler2();
        }
    }

    var defaultJobOptions = ['config'];

    function jobOptions(merge) {
        if (typeof merge === "undefined") { merge = []; }
        return defaultJobOptions.concat(merge);
    }

    var Job = (function () {
        function Job() {
        }
        return Job;
    })();

    function init(ctx) {
        return loadPleonasm();
    }

    function getAPIJob(ctx) {
        var d = Q.defer();

        init(ctx).then(function () {
            if (ctx.hasArg('config')) {
                return FS.isFile(ctx.getArg('config')).then(function (isFile) {
                    if (!isFile) {
                        throw new Error('specified --config is not a file: ' + ctx.getArg('config'));
                    }
                    return null;
                });
            }
            return null;
        }).then(function () {
            var job = new Job();
            job.context = getContext(ctx);
            job.api = new tsd.API(job.context);

            var required = ctx.hasArg('config');

            return job.api.readConfig(!required).then(function () {
                d.resolve(job);
            });
        }).fail(d.reject);

        return d.promise;
    }

    function getSelectorJob(ctx) {
        return getAPIJob(ctx).then(function (job) {
            if (ctx.numArgs !== 1) {
                throw new Error('pass one selector pattern');
            }

            job.selector = new tsd.Selector(ctx.getArgAt(0));
            job.selector.blobSha = ctx.getArg('blob');
            job.selector.commitSha = ctx.getArg('commit');

            job.selector.timeout = ctx.getArg('timeout');
            job.selector.limitApi = ctx.getArg('limit');
            job.selector.minMatches = ctx.getArg('min');
            job.selector.maxMatches = ctx.getArg('max');

            job.selector.saveToConfig = ctx.getArg('save');
            job.selector.overwriteFiles = ctx.getArg('overwrite');
            job.selector.resolveDependencies = ctx.getArg('resolve');

            return job;
        });
    }

    function getExpose() {
        var expose = new xm.Expose('', output);

        expose.before = function (cmd, ctx) {
            return printPreviewNotice();
        };

        expose.defineGroup(function (group) {
            group.name = 'command';
            group.label = 'Main commands';
            group.options = ['config', 'commit', 'cacheDir', 'min', 'max', 'limit'];
            group.sorter = function (one, two) {
                var sort;

                sort = xm.exposeSortHasElem(one.groups, two.groups, 'primary');
                if (sort !== 0) {
                    return sort;
                }
                sort = xm.exposeSortHasElem(one.groups, two.groups, 'local');
                if (sort !== 0) {
                    return sort;
                }
                sort = xm.exposeSortHasElem(one.groups, two.groups, 'info');
                if (sort !== 0) {
                    return sort;
                }
                return xm.exposeSortIndex(one, two);
            };
        });

        expose.defineGroup(function (group) {
            group.name = 'help';
            group.label = 'Help commands';
        });

        expose.defineOption(function (opt) {
            opt.name = 'version';
            opt.short = 'V';
            opt.description = 'Display version information';
            opt.type = 'flag';
            opt.command = 'version';
            opt.global = true;
        });

        expose.defineOption(function (opt) {
            opt.name = 'verbose';
            opt.description = 'Verbose output';
            opt.type = 'flag';
            opt.default = false;
            opt.global = true;
        });

        expose.defineOption(function (opt) {
            opt.name = 'color';
            opt.description = 'Specify CLI color mode';
            opt.type = 'string';
            opt.placeholder = 'name';
            opt.global = true;
            opt.enum = styleMap.keys();
            opt.apply = function (value, argv) {
                useColor(value, argv);
            };
        });

        expose.defineOption(function (opt) {
            opt.name = 'dev';
            opt.description = 'Development mode';
            opt.type = 'flag';
            opt.global = true;
        });

        expose.defineOption(function (opt) {
            opt.name = 'config';
            opt.description = 'Path to config file';
            opt.type = 'string';
            opt.placeholder = 'path';
            opt.global = false;
        });

        expose.defineOption(function (opt) {
            opt.name = 'cacheDir';
            opt.description = 'Path to cache directory';
            opt.type = 'string';
            opt.placeholder = 'path';
            opt.global = false;
        });

        expose.defineOption(function (opt) {
            opt.name = 'save';
            opt.short = 's';
            opt.description = 'Save to config file';
            opt.type = 'flag';
            opt.default = false;
        });

        expose.defineOption(function (opt) {
            opt.name = 'overwrite';
            opt.short = 'o';
            opt.description = 'Overwrite existing definitions';
            opt.type = 'flag';
            opt.default = false;
        });

        expose.defineOption(function (opt) {
            opt.name = 'limit';
            opt.short = 'l';
            opt.description = 'Sanity limit for expensive API calls, 0 = unlimited';
            opt.type = 'int';
            opt.default = 3;
            opt.placeholder = 'num';
            opt.note = ['not implemented'];
        });

        expose.defineOption(function (opt) {
            opt.name = 'max';
            opt.description = 'Enforce a maximum amount of results, 0 = unlimited';
            opt.type = 'int';
            opt.default = 0;
            opt.placeholder = 'num';
            opt.note = ['not implemented'];
        });

        expose.defineOption(function (opt) {
            opt.name = 'min';
            opt.description = 'Enforce a minimum amount of results';
            opt.type = 'int';
            opt.default = 0;
            opt.placeholder = 'num';
            opt.note = ['not implemented'];
        });

        expose.defineOption(function (opt) {
            opt.name = 'timeout';
            opt.description = 'Set operation timeout in milliseconds, 0 = unlimited';
            opt.type = 'int';
            opt.default = 0;
            opt.global = true;
            opt.placeholder = 'ms';
            opt.note = ['not implemented'];
        });

        expose.defineOption(function (opt) {
            opt.name = 'blob';
            opt.short = 'b';
            opt.description = 'Blob hash';
            opt.type = 'string';
            opt.placeholder = 'sha1';
            opt.global = false;
        });

        expose.defineOption(function (opt) {
            opt.name = 'commit';
            opt.short = 'c';
            opt.description = 'Commit hash';
            opt.type = 'string';
            opt.placeholder = 'sha1';
            opt.global = false;
            opt.note = ['partially implemented'];
        });

        expose.defineOption(function (opt) {
            opt.name = 'resolve';
            opt.short = 'r';
            opt.description = 'Include reference dependencies';
            opt.type = 'flag';
            opt.global = false;
            opt.default = false;
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'version';
            cmd.label = 'Display version';
            cmd.groups = ['help'];
            cmd.execute = (function (ctx) {
                output.line(xm.PackageJSON.getLocal().version);
                return null;
            });
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'settings';
            cmd.label = 'Display config settings';
            cmd.options = ['config', 'cacheDir'];
            cmd.groups = ['support'];
            cmd.execute = function (ctx) {
                return getAPIJob(ctx).then(function (job) {
                    job.api.context.logInfo(true);
                    return null;
                });
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'search';
            cmd.label = 'Search definitions';
            cmd.variadic = ['selector'];
            cmd.groups = ['command', 'primary', 'query'];
            cmd.execute = function (ctx) {
                return getSelectorJob(ctx).then(function (job) {
                    return job.api.search(job.selector).then(function (result) {
                        reportSucces(null);

                        result.selection.forEach(function (file) {
                            printFile(file);
                            output.line();
                        });
                    });
                }, reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'install';
            cmd.label = 'Install definitions';
            cmd.options = ['overwrite', 'save', 'resolve'];
            cmd.variadic = ['selector'];
            cmd.groups = ['command', 'primary', 'write'];
            cmd.execute = function (ctx) {
                return getSelectorJob(ctx).then(function (job) {
                    return job.api.install(job.selector).then(function (result) {
                        reportSucces(null);

                        result.written.keys().sort().forEach(function (path) {
                            var file = result.written.get(path);
                            output.line(file.toString());
                        });
                    });
                }, reportError);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'info';
            cmd.label = 'Display definition info';
            cmd.variadic = ['selector'];
            cmd.options = ['resolve'];
            cmd.groups = ['command', 'primary', 'query'];
            cmd.execute = function (ctx) {
                return getSelectorJob(ctx).then(function (job) {
                    return job.api.info(job.selector).then(function (result) {
                        reportSucces(null);

                        result.selection.sort(tsd.DefUtil.fileCompare).forEach(function (file) {
                            printFileHead(file);
                            printFileInfo(file);
                            printFileCommit(file);
                            printDependencies(file);
                        });
                    });
                }, reportError, reportProgress);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'history';
            cmd.label = 'Display definition history';
            cmd.variadic = ['selector'];
            cmd.groups = ['command', 'primary', 'query'];
            cmd.execute = function (ctx) {
                return getSelectorJob(ctx).then(function (job) {
                    return job.api.history(job.selector).then(function (result) {
                        reportSucces(null);

                        result.definitions.sort(tsd.DefUtil.defCompare).forEach(function (def) {
                            printDefHead(def);
                            printSubHead('head:');
                            printFileCommit(def.head);
                            printSubHead('history:');

                            def.history.slice(0).forEach(function (file) {
                                printFileInfo(file, true);
                                printFileCommit(file);
                            });
                        });
                    });
                }, reportError, reportProgress);
            };
        });

        expose.defineCommand(function (cmd) {
            cmd.name = 'reinstall';
            cmd.label = 'Re-install definitions from config';
            cmd.options = ['overwrite'];
            cmd.groups = ['command', 'local', 'write'];
            cmd.execute = function (ctx) {
                return getAPIJob(ctx).then(function (job) {
                    return job.api.reinstall(ctx.getArg('option')).then(function (result) {
                        reportSucces(null);

                        output.line();

                        result.written.keys().sort().forEach(function (path) {
                            var file = result.written.get(path);
                            output.line(file.toString());

                            output.line();
                        });
                    });
                }, reportError, reportProgress);
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
    var Q = require('q');
    Q.longStackSupport = true;

    require('source-map-support').install();

    process.setMaxListeners(20);
})(tsd || (tsd = {}));
(module).exports = {
    tsd: tsd,
    runARGV: tsd.runARGV,
    getAPI: function (configPath, verbose) {
        if (typeof verbose === "undefined") { verbose = false; }
        xm.assertVar(configPath, 'string', 'configPath');
        return new tsd.API(new tsd.Context(configPath, verbose));
    }
};
//# sourceMappingURL=api.js.map
