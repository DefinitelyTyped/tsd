var xm;
(function (xm) {
    var Q = require('q');
    var FS = require('q-io/fs');
    var mkdirp = require('mkdirp');
    var path = require('path');
    var fs = require('fs');
    function mkdirCheckSync(dir, writable, testWritable) {
        if (typeof writable === "undefined") { writable = false; }
        if (typeof testWritable === "undefined") { testWritable = false; }
        dir = path.resolve(dir);
        if(fs.existsSync(dir)) {
            if(!fs.statSync(dir).isDirectory()) {
                throw (new Error('path exists but is not a directory: ' + dir));
            }
            if(writable) {
                fs.chmodSync(dir, '744');
            }
        } else {
            if(writable) {
                mkdirp.sync(dir, '744');
            } else {
                mkdirp.sync(dir);
            }
        }
        if(testWritable) {
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
    xm.mkdirCheckSync = mkdirCheckSync;
    function mkdirCheckQ(dir, writable, testWritable) {
        if (typeof writable === "undefined") { writable = false; }
        if (typeof testWritable === "undefined") { testWritable = false; }
        dir = path.resolve(dir);
        return FS.exists(dir).then(function (exists) {
            if(exists) {
                return FS.isDirectory(dir).then(function (isDir) {
                    if(!isDir) {
                        throw (new Error('path exists but is not a directory: ' + dir));
                    }
                    if(writable) {
                        return FS.chmod(dir, '744');
                    }
                    return null;
                });
            }
            if(writable) {
                return Q.nfcall(mkdirp, dir, '744');
            }
            return Q.nfcall(mkdirp, dir);
        }).then(function () {
            if(testWritable) {
                var testFile = path.join(dir, 'mkdirCheck_' + Math.round(Math.random() * Math.pow(10, 10)).toString(16) + '.tmp');
                return FS.write(testFile, 'test').then(function () {
                    return FS.remove(testFile);
                }).catch(function (err) {
                    throw new Error('no write access to: ' + dir + ' -> ' + err);
                });
            }
            return null;
        }).thenResolve(dir);
    }
    xm.mkdirCheckQ = mkdirCheckQ;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var fs = require('fs');
    var Q = require('q');
    var FS = require('q-io/fs');
    var path = require('path');
    var util = require('util');
    (function (FileUtil) {
        function parseJson(text) {
            var json;
            try  {
                json = JSON.parse(text);
            } catch (err) {
                if(err.name === 'SyntaxError') {
                    xm.log.error(err);
                    xm.log('---');
                    xm.log(text);
                    xm.log('---');
                }
                throw (err);
            }
            return json;
        }
        function readJSONSync(src) {
            return parseJson(fs.readFileSync(src, {
                encoding: 'utf8'
            }));
        }
        FileUtil.readJSONSync = readJSONSync;
        function readJSON(src, callback) {
            fs.readFile(path.resolve(src), {
                encoding: 'utf8'
            }, function (err, text) {
                if(err || typeof text !== 'string') {
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
            return FS.read(src, {
                encoding: 'utf8'
            }).then(function (text) {
                return parseJson(text);
            });
        }
        FileUtil.readJSONPromise = readJSONPromise;
        function writeJSONSync(dest, data) {
            dest = path.resolve(dest);
            xm.mkdirCheckSync(path.dirname(dest));
            fs.writeFileSync(dest, JSON.stringify(data, null, 2), {
                encoding: 'utf8'
            });
        }
        FileUtil.writeJSONSync = writeJSONSync;
        function writeJSONPromise(dest, data) {
            dest = path.resolve(dest);
            return xm.mkdirCheckQ(path.dirname(dest), true).then(function () {
                return FS.write(dest, JSON.stringify(data, null, 2), {
                    encoding: 'utf8'
                });
            });
        }
        FileUtil.writeJSONPromise = writeJSONPromise;
    })(xm.FileUtil || (xm.FileUtil = {}));
    var FileUtil = xm.FileUtil;
})(xm || (xm = {}));
var xm;
(function (xm) {
    function eachElem(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for(var i = 0, ii = collection.length; i < ii; i++) {
            if(callback.call(thisArg, collection[i], i, collection) === false) {
                return;
            }
        }
    }
    xm.eachElem = eachElem;
    function eachProp(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for(var prop in collection) {
            if(collection.hasOwnProperty(prop)) {
                if(callback.call(thisArg, collection[prop], prop, collection) === false) {
                    return;
                }
            }
        }
    }
    xm.eachProp = eachProp;
    function reduceArray(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for(var i = 0, ii = collection.length; i < ii; i++) {
            memo = callback.call(thisArg, memo, collection[i], i, collection);
        }
        return memo;
    }
    xm.reduceArray = reduceArray;
    function reduceHash(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for(var prop in collection) {
            if(collection.hasOwnProperty(prop)) {
                memo = callback.call(thisArg, memo, collection[prop], prop, collection);
            }
        }
        return memo;
    }
    xm.reduceHash = reduceHash;
    function mapArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for(var i = 0, ii = collection.length; i < ii; i++) {
            map[i] = callback.call(thisArg, collection[i], i, collection);
        }
        return map;
    }
    xm.mapArray = mapArray;
    function mapHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = {
        };
        for(var prop in collection) {
            if(collection.hasOwnProperty(prop)) {
                map[prop] = callback.call(thisArg, collection[prop], prop, collection);
            }
        }
        return map;
    }
    xm.mapHash = mapHash;
    function filterArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for(var i = 0, ii = collection.length; i < ii; i++) {
            if(callback.call(thisArg, collection[i], i, collection)) {
                map.push(collection[i]);
            }
        }
        return map;
    }
    xm.filterArray = filterArray;
    function filterHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var res = {
        };
        for(var prop in collection) {
            if(collection.hasOwnProperty(prop) && callback.call(thisArg, collection[prop], prop, collection)) {
                res[prop] = collection[prop];
            }
        }
        return res;
    }
    xm.filterHash = filterHash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var util = require('util');
    require('colors');
    var ConsoleLineWriter = (function () {
        function ConsoleLineWriter() { }
        ConsoleLineWriter.prototype.writeln = function (str) {
            console.log(str);
        };
        return ConsoleLineWriter;
    })();
    xm.ConsoleLineWriter = ConsoleLineWriter;    
    function getLogger(label, writer) {
        writer = writer || new xm.ConsoleLineWriter();
        label = arguments.length > 0 ? (String(label) + ': ').cyan : '';
        var writeMulti = function (prefix, postfix, args) {
            if(logger.mute) {
                return;
            }
            var ret = [];
            for(var i = 0, ii = args.length; i < ii; i++) {
                var value = args[i];
                if(value && typeof value === 'object') {
                    ret.push(util.inspect(value, {
                        showHidden: false,
                        depth: 8
                    }));
                } else {
                    ret.push(value);
                }
            }
            writer.writeln(label + prefix + ret.join('; ') + postfix);
        };
        var plain = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            writeMulti('', '', args);
        };
        var logger = (function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            plain.apply(null, args);
        });
        logger.log = plain;
        logger.mute = false;
        logger.ok = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            writeMulti('ok: '.green, '', args);
        };
        logger.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            writeMulti('warn: '.yellow, '', args);
        };
        logger.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            writeMulti('error: '.red, '', args);
        };
        logger.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            writeMulti('debug: '.cyan, '', args);
        };
        logger.inspect = function (value, label, depth) {
            if (typeof depth === "undefined") { depth = 8; }
            label = label ? label + ':\n' : '';
            writer.writeln(label + util.inspect(value, {
                showHidden: false,
                depth: depth
            }));
        };
        return logger;
    }
    xm.getLogger = getLogger;
    xm.log = getLogger();
})(xm || (xm = {}));
var xm;
(function (xm) {
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
        if(natives[str]) {
            return natives[str];
        }
        if(obj === null) {
            return 'null';
        }
        if(obj === undefined) {
            return 'undefined';
        }
        if(obj === Object(obj)) {
            return 'object';
        }
        return typeof obj;
    }
    xm.typeOf = typeOf;
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
        boolean: isBoolean
    };
    function hasOwnProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    function isType(obj, type) {
        if(hasOwnProp(typeMap, type)) {
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
    function getTypeOfMap(add) {
        var obj = {
        };
        for(var name in typeMap) {
            if(hasOwnProp(typeMap, name)) {
                obj[name] = typeMap[name];
            }
        }
        if(add) {
            for(var name in add) {
                if(hasOwnProp(add, name) && isFunction(add[name])) {
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
            if(hasOwnProp(typeMap, type)) {
                return typeMap[type].call(null, obj);
            }
            return false;
        };
    }
    xm.getTypeOfWrap = getTypeOfWrap;
})(xm || (xm = {}));
var xm;
(function (xm) {
    function getFuncLabel(func) {
        var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(func);
        if(match && match.length >= 3) {
            return match[1] + '(' + match[2] + ')';
        }
        if(func.name) {
            return func.name;
        }
        return '<anonymous>';
    }
    xm.getFuncLabel = getFuncLabel;
    function toValueStrim(obj, depth) {
        if (typeof depth === "undefined") { depth = 2; }
        var type = xm.typeOf(obj);
        var strCut = 20;
        var objCut = 30;
        depth--;
        switch(type) {
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
                if(depth <= 0) {
                    return '<maximum recursion>';
                }
                return '[' + trimLine(obj.map(function (value) {
                    return toValueStrim(value, depth);
                }).join(','), objCut, false) + ']';
            }
            case 'object': {
                if(depth <= 0) {
                    return '<maximum recursion>';
                }
                return '{' + trimLine(Object.keys(obj).sort().map(function (key) {
                    return trimLine(key) + ':' + toValueStrim(obj[key], depth);
                }).join(','), objCut, false) + '}';
            }
            default:
                throw (new Error('toValueStrim: cannot serialise type: ' + type));
        }
    }
    xm.toValueStrim = toValueStrim;
    function trimLine(value, cutoff, quotes) {
        if (typeof cutoff === "undefined") { cutoff = 30; }
        if (typeof quotes === "undefined") { quotes = true; }
        value = String(value).replace('\r', '\\r').replace('\n', '\\n').replace('\t', '\\t');
        if(value.length > cutoff - 2) {
            value = value.substr(0, cutoff - 5) + '...';
        }
        return quotes ? '"' + value + '"' : value;
    }
    xm.trimLine = trimLine;
})(xm || (xm = {}));
var xm;
(function (xm) {
    function isSha(value) {
        if(typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{40}$/.test(value);
    }
    function isMd5(value) {
        if(typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{32}$/.test(value);
    }
    var typeOfAssert = xm.getTypeOfMap({
        sha1: isSha,
        md5: isMd5
    });
    function assertVar(label, value, type, opt) {
        if (typeof opt === "undefined") { opt = false; }
        if(arguments.length < 3) {
            throw new Error('assertVar() expected at least 3 arguments but got "' + arguments.length + '"');
        }
        var valueKind = xm.typeOf(value);
        var typeKind = xm.typeOf(type);
        var typeStrim = xm.toValueStrim(type);
        if(valueKind === 'undefined' || valueKind === 'null') {
            if(!opt) {
                throw new Error('expected "' + label + '" to be defined but got "' + value + '"');
            }
        } else if(typeKind === 'function') {
            if(!(value instanceof type)) {
                throw new Error('expected "' + label + '" to be instanceof ' + typeStrim + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
            }
        } else if(typeKind === 'string') {
            if(typeOfAssert.hasOwnProperty(type)) {
                var check = typeOfAssert[type];
                if(!check(value)) {
                    throw new Error('expected "' + label + '" to be a ' + typeStrim + ' but got "' + valueKind + '": ' + xm.toValueStrim(value));
                }
            } else {
                throw new Error('unknown type assertion parameter ' + typeStrim + ' for "' + label + '"');
            }
        } else {
            throw new Error('bad type assertion parameter ' + typeStrim + ' for "' + label + '"');
        }
    }
    xm.assertVar = assertVar;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var ObjectUtil = (function () {
        function ObjectUtil() { }
        ObjectUtil.defineProp = function defineProp(object, property, settings) {
            Object.defineProperty(object, property, settings);
        };
        ObjectUtil.defineProps = function defineProps(object, propertyNames, settings) {
            propertyNames.forEach(function (property) {
                ObjectUtil.defineProp(object, property, settings);
            });
        };
        ObjectUtil.hidePrefixed = function hidePrefixed(object, ownOnly) {
            if (typeof ownOnly === "undefined") { ownOnly = true; }
            for(var property in object) {
                if(property.charAt(0) === '_' && (!ownOnly || object.hasOwnProperty(property))) {
                    ObjectUtil.defineProp(object, property, {
                        enumerable: false
                    });
                }
            }
        };
        ObjectUtil.hideFunctions = function hideFunctions(object) {
            for(var property in object) {
                if(xm.isFunction(object)) {
                    ObjectUtil.defineProp(object, property, {
                        enumerable: false
                    });
                }
            }
        };
        return ObjectUtil;
    })();
    xm.ObjectUtil = ObjectUtil;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    var pkginfo = require('pkginfo');
    var PackageJSON = (function () {
        function PackageJSON(pkg, path) {
            if (typeof path === "undefined") { path = null; }
            this.path = path;
            xm.assertVar('pkg', pkg, 'object');
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
        PackageJSON.find = function find() {
            if(!PackageJSON._localPath) {
                PackageJSON._localPath = pkginfo.find((module));
            }
            return PackageJSON._localPath;
        };
        PackageJSON.getLocal = function getLocal() {
            if(!PackageJSON._local) {
                var src = PackageJSON.find();
                if(!src) {
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
    var nameExp = /^(\w[\w_\.-]+?\w)\/(\w[\w_\.-]+?\w)\.d\.ts$/;
    var Def = (function () {
        function Def(path) {
            this.history = [];
            xm.assertVar('path', path, 'string');
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
        Def.isDefPath = function isDefPath(path) {
            return nameExp.test(path);
        };
        Def.getPath = function getPath(path) {
            return nameExp.test(path);
        };
        Def.getFrom = function getFrom(path) {
            var match = nameExp.exec(path);
            if(!match) {
                return null;
            }
            if(match.length < 1) {
                return null;
            }
            if(match[1].length < 1 || match[2].length < 1) {
                return null;
            }
            var file = new tsd.Def(path);
            file.project = match[1];
            file.name = match[2];
            return file;
        };
        return Def;
    })();
    tsd.Def = Def;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
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
            if(this.submodule) {
                ret += ' ' + this.submodule;
            }
            if(this.version) {
                ret += ' ' + this.version;
            }
            if(this.description) {
                ret += ' ' + JSON.stringify(this.description);
            }
            return ret;
        };
        DefInfo.prototype.isValid = function () {
            if(!this.name) {
                return false;
            }
            if(this.authors.length === 0) {
                return false;
            }
            if(!this.reposUrl) {
                return false;
            }
            return true;
        };
        return DefInfo;
    })();
    tsd.DefInfo = DefInfo;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var DefVersion = (function () {
        function DefVersion(def, commit) {
            this.dependencies = [];
            this.solved = false;
            xm.assertVar('def', def, tsd.Def);
            xm.assertVar('commit', commit, tsd.DefCommit);
            this._def = def;
            this._commit = commit;
            xm.ObjectUtil.hidePrefixed(this);
        }
        Object.defineProperty(DefVersion.prototype, "key", {
            get: function () {
                if(!this._def || !this._commit) {
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
        DefVersion.prototype.toString = function () {
            var str = (this._def ? this._def.path : '<no def>');
            str += ' : ' + (this._commit ? this._commit.commitShort : '<no blob-sha>');
            return str;
        };
        return DefVersion;
    })();
    tsd.DefVersion = DefVersion;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var assert = require('assert');
    var tv4 = require('tv4').tv4;
    var InstalledDef = (function () {
        function InstalledDef(path) {
            this.path = path;
        }
        InstalledDef.prototype.update = function (source) {
            xm.assertVar('file', source, tsd.DefVersion);
            if(typeof source.content !== 'string' || source.content.length === 0) {
                throw new Error('expected file to have .content: ' + source.def.path);
            }
            this.path = source.def.path;
            this.commitSha = source.commit.commitSha;
            this.contentHash = xm.md5(source.content);
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
            xm.assertVar('schema', schema, 'object');
            this._schema = schema;
            this.typingsPath = tsd.Const.typingsFolder;
            this.version = tsd.Const.configVersion;
            this.repo = tsd.Const.definitelyRepo;
            this.ref = tsd.Const.mainBranch;
            xm.ObjectUtil.hidePrefixed(this);
        }
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
            xm.assertVar('file', file, tsd.DefVersion);
            var def;
            if(this._installed.has(file.def.path)) {
                def = this._installed.get(file.def.path);
            } else {
                def = new tsd.InstalledDef();
            }
            def.update(file);
            this._installed.set(file.def.path, def);
        };
        Config.prototype.hasFile = function (path) {
            xm.assertVar('path', path, 'string');
            return this._installed.has(path);
        };
        Config.prototype.getFile = function (path) {
            xm.assertVar('path', path, 'string');
            return this._installed.get(path, null);
        };
        Config.prototype.removeFile = function (path) {
            xm.assertVar('path', path, 'string');
            this._installed.remove(path);
        };
        Config.prototype.getInstalled = function () {
            return this._installed.values();
        };
        Config.prototype.toJSON = function () {
            var json = {
                typingsPath: this.typingsPath,
                version: this.version,
                repo: this.repo,
                ref: this.ref,
                installed: {
                }
            };
            this._installed.values().forEach(function (file) {
                json.installed[file.path] = {
                    commit: file.commitSha,
                    hash: file.contentHash
                };
            });
            return json;
        };
        Config.prototype.parseJSON = function (json) {
            var _this = this;
            xm.assertVar('json', json, 'object');
            this._installed.clear();
            var res = tv4.validateResult(json, this._schema);
            if(!res.valid || res.missing.length > 0) {
                this.log.error(res.error.message);
                if(res.error.dataPath) {
                    this.log.error(res.error.dataPath);
                }
                throw (new Error('malformed config: doesn\'t comply with json-schema'));
            }
            this.typingsPath = json.typingsPath;
            this.version = json.version;
            this.repo = json.repo;
            this.ref = json.ref;
            xm.eachProp(json.installed, function (data, path) {
                var installed = new tsd.InstalledDef(path);
                installed.commitSha = data.commit;
                installed.contentHash = data.hash;
                _this._installed.set(path, installed);
            });
        };
        return Config;
    })();
    tsd.Config = Config;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    tsd.Const = {
        ident: 'tsd',
        configFile: 'tsd-config.json',
        cacheDir: 'tsd-cache',
        configSchemaFile: 'tsd-config_v4.json',
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
    var path = require('path');
    var Paths = (function () {
        function Paths() {
            this.startCwd = path.resolve(process.cwd());
            this.configFile = path.resolve(this.startCwd, tsd.Const.configFile);
            this.cacheDir = path.resolve(this.startCwd, tsd.Const.cacheDir);
        }
        Paths.getCacheDirName = function getCacheDirName() {
            return (process.platform === 'win32' ? tsd.Const.cacheDir : '.' + tsd.Const.ident);
        };
        Paths.getUserHome = function getUserHome() {
            return (process.env.HOME || process.env.USERPROFILE);
        };
        Paths.getUserCacheRoot = function getUserCacheRoot() {
            return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
        };
        Paths.getUserCacheDir = function getUserCacheDir() {
            return path.resolve(Paths.getUserCacheRoot(), Paths.getCacheDirName());
        };
        return Paths;
    })();
    tsd.Paths = Paths;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var assert = require('assert');
    var Q = require('q');
    var tv4 = require('tv4').tv4;
    require('source-map-support').install();
    process.setMaxListeners(20);
    Q.longStackSupport = true;
    var Context = (function () {
        function Context(configFile, verbose) {
            if (typeof configFile === "undefined") { configFile = null; }
            if (typeof verbose === "undefined") { verbose = false; }
            this.configFile = configFile;
            this.verbose = verbose;
            this.log = xm.getLogger('Context');
            this.packageInfo = xm.PackageJSON.getLocal();
            this.paths = new tsd.Paths();
            if(configFile) {
                this.paths.configFile = path.resolve(configFile);
            }
            var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(xm.PackageJSON.find()), 'schema', tsd.Const.configSchemaFile));
            this.config = new tsd.Config(schema);
        }
        Context.prototype.logInfo = function (details) {
            if (typeof details === "undefined") { details = false; }
            this.log(this.packageInfo.getNameVersion());
            this.log('repo: ' + this.config.repo + ' #' + this.config.ref);
            if(details) {
                this.log.inspect(this.paths, 'paths');
                this.log.inspect(this.config, 'config');
                this.log.inspect(this.config.getInstalled(), 'config');
            }
        };
        return Context;
    })();
    tsd.Context = Context;    
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    var hasOwnProp = Object.prototype.hasOwnProperty;
    var KeyValueMap = (function () {
        function KeyValueMap(data) {
            this._prefix = '#';
            this._store = {
            };
            if(data) {
                this.import(data);
            }
            xm.ObjectUtil.hidePrefixed(this);
        }
        KeyValueMap.prototype.has = function (key) {
            if(typeof key === 'undefined') {
                return false;
            }
            key = this._prefix + key;
            return hasOwnProp.call(this._store, key);
        };
        KeyValueMap.prototype.get = function (key, alt) {
            if (typeof alt === "undefined") { alt = undefined; }
            if(typeof key === 'undefined') {
                return alt;
            }
            key = this._prefix + key;
            if(hasOwnProp.call(this._store, key)) {
                return this._store[key];
            }
            return alt;
        };
        KeyValueMap.prototype.set = function (key, value) {
            if(typeof key === 'undefined') {
                return;
            }
            key = this._prefix + key;
            this._store[key] = value;
        };
        KeyValueMap.prototype.remove = function (key) {
            if(typeof key === 'undefined') {
                return;
            }
            key = this._prefix + key;
            if(hasOwnProp.call(this._store, key)) {
                delete this._store[key];
            }
        };
        KeyValueMap.prototype.keys = function () {
            var len = this._prefix.length;
            var ret = [];
            for(var key in this._store) {
                if(hasOwnProp.call(this._store, key)) {
                    ret.push(key.substr(len));
                }
            }
            return ret;
        };
        KeyValueMap.prototype.values = function (allow) {
            var keys = this.keys();
            var ret = [];
            for(var i = 0, ii = keys.length; i < ii; i++) {
                var key = keys[i];
                if(!allow || allow.indexOf(key) > -1) {
                    ret.push(this.get(key));
                }
            }
            return ret;
        };
        KeyValueMap.prototype.clear = function (keep) {
            var keys = this.keys();
            for(var i = 0, ii = keys.length; i < ii; i++) {
                var key = keys[i];
                if(!keep || keep.indexOf(key) > -1) {
                    this.remove(key);
                }
            }
        };
        KeyValueMap.prototype.import = function (data, allow) {
            if(typeof data !== 'object') {
                return;
            }
            for(var key in data) {
                if(hasOwnProp.call(data, key) && (!allow || allow.indexOf(key) > -1)) {
                    this.set(key, data[key]);
                }
            }
        };
        KeyValueMap.prototype.export = function (allow) {
            var ret = {
            };
            var keys = this.keys();
            for(var i = 0, ii = keys.length; i < ii; i++) {
                var key = keys[i];
                if(!allow || allow.indexOf(key) > -1) {
                    ret[key] = this.get(key);
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
            if(this.log && this.logger) {
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
    function jsonToIdent(obj) {
        var ret = '';
        var sep = ';';
        var type = xm.typeOf(obj);
        if(type === 'string' || type === 'number' || type === 'boolean') {
            ret += JSON.stringify(obj) + sep;
        } else if(type === 'regexp' || type === 'function') {
            throw (new Error('jsonToIdent: cannot serialise: ' + type));
        } else if(type === 'date') {
            ret += '<Date>' + obj.getTime() + sep;
        } else if(type === 'array') {
            ret += '[';
            obj.forEach(function (value) {
                ret += jsonToIdent(value);
            });
            ret += ']' + sep;
        } else if(type === 'object') {
            var keys = Object.keys(obj);
            keys.sort();
            ret += '{';
            keys.forEach(function (key) {
                ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
            });
            ret += '}' + sep;
        } else {
            throw (new Error('jsonToIdent: cannot serialise value: ' + type + ':' + obj));
        }
        return ret;
    }
    xm.jsonToIdent = jsonToIdent;
    function jsonToIdentHash(obj, length) {
        if (typeof length === "undefined") { length = 0; }
        var ident = sha1(jsonToIdent(obj));
        if(length > 0) {
            ident = ident.substr(0, length);
        }
        return ident;
    }
    xm.jsonToIdentHash = jsonToIdentHash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var CachedJSONValue = (function () {
        function CachedJSONValue(label, key, data) {
            this._key = null;
            this._label = null;
            this._data = null;
            this._lastSet = null;
            xm.assertVar('label', label, 'string');
            xm.assertVar('key', key, 'string');
            this._label = label;
            this._key = key;
            this.setData(data);
            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedJSONValue.prototype.setData = function (data) {
            this._data = xm.isUndefined(data) ? null : data;
            this._lastSet = new Date();
        };
        CachedJSONValue.prototype.toJSON = function () {
            return {
                key: this.key,
                hash: this.getHash(),
                data: this.data,
                label: this.label,
                lastSet: this.lastSet.getTime()
            };
        };
        CachedJSONValue.fromJSON = function fromJSON(json) {
            xm.assertVar('label', json.label, 'string');
            xm.assertVar('key', json.key, 'string');
            xm.assertVar('lastSet', json.lastSet, 'number');
            var call = new xm.CachedJSONValue(json.label, json.key, json.data);
            call._lastSet = new Date(json.lastSet);
            return call;
        };
        CachedJSONValue.getHash = function getHash(key) {
            return xm.sha1(key);
        };
        CachedJSONValue.prototype.getHash = function () {
            return xm.CachedJSONValue.getHash(this._key);
        };
        Object.defineProperty(CachedJSONValue.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CachedJSONValue.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CachedJSONValue.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CachedJSONValue.prototype, "lastSet", {
            get: function () {
                return this._lastSet;
            },
            enumerable: true,
            configurable: true
        });
        return CachedJSONValue;
    })();
    xm.CachedJSONValue = CachedJSONValue;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    var Q = require('q');
    var assert = require('assert');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var CachedJSONStore = (function () {
        function CachedJSONStore(storeFolder) {
            this.stats = new xm.StatCounter();
            this._formatVersion = '0.0.3';
            xm.assertVar('storeFolder', storeFolder, 'string');
            storeFolder = storeFolder.replace(/[\\\/]+$/, '') + '-fmt' + this._formatVersion;
            this._dir = path.resolve(storeFolder);
            this.stats.logger = xm.getLogger('CachedJSONStore');
            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedJSONStore.prototype.init = function () {
            var _this = this;
            this.stats.count('init');
            return FS.exists(this._dir).then(function (exists) {
                if(!exists) {
                    _this.stats.count('init-dir-create', _this._dir);
                    return xm.mkdirCheckQ(_this._dir, true);
                }
                return FS.isDirectory(_this._dir).then(function (isDir) {
                    if(isDir) {
                        _this.stats.count('init-dir-exists', _this._dir);
                        return null;
                    } else {
                        _this.stats.count('init-dir-error', _this._dir);
                        throw new Error('is not a directory: ' + _this._dir);
                    }
                });
            }).fail(function (err) {
                _this.stats.count('init-error');
                throw err;
            });
        };
        CachedJSONStore.prototype.getValue = function (key) {
            var _this = this;
            var src = path.join(this._dir, xm.CachedJSONValue.getHash(key) + '.json');
            this.stats.count('get');
            return this.init().then(function () {
                return FS.exists(src);
            }).then(function (exists) {
                if(exists) {
                    _this.stats.count('get-exists');
                    return xm.FileUtil.readJSONPromise(src).then(function (json) {
                        var cached;
                        try  {
                            cached = xm.CachedJSONValue.fromJSON(json);
                        } catch (e) {
                            _this.stats.count('get-read-error');
                            throw (new Error(src + ':' + e));
                        }
                        _this.stats.count('get-read-success');
                        return cached;
                    });
                }
                _this.stats.count('get-miss');
                return null;
            }).fail(function (err) {
                _this.stats.count('get-error');
                throw err;
            });
        };
        CachedJSONStore.prototype.storeValue = function (res) {
            var _this = this;
            var dest = path.join(this._dir, res.getHash() + '.json');
            this.stats.count('store');
            return this.init().then(function () {
                return FS.exists(dest);
            }).then(function (exists) {
                if(exists) {
                    _this.stats.count('store-exists');
                    return FS.remove(dest);
                }
                _this.stats.count('store-new');
                return xm.mkdirCheckQ(path.dirname(dest), true);
            }).then(function () {
                _this.stats.count('store-write');
                var data = JSON.stringify(res.toJSON(), null, 2);
                return FS.write(dest, data);
            }).then(function () {
                _this.stats.count('store-write-success');
                return res;
            }, function (err) {
                _this.stats.count('store-write-error');
                throw err;
            });
        };
        return CachedJSONStore;
    })();
    xm.CachedJSONStore = CachedJSONStore;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    var _ = require('underscore');
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var CachedLoaderOptions = (function () {
        function CachedLoaderOptions() {
            this.cacheRead = true;
            this.cacheWrite = true;
            this.remoteRead = true;
            xm.ObjectUtil.hideFunctions(this);
        }
        CachedLoaderOptions.prototype.modeUpdate = function () {
            this.cacheRead = false;
            this.remoteRead = true;
            this.cacheWrite = true;
        };
        CachedLoaderOptions.prototype.modeCached = function () {
            this.cacheRead = true;
            this.remoteRead = false;
            this.cacheWrite = false;
        };
        CachedLoaderOptions.prototype.modeRemote = function () {
            this.cacheRead = false;
            this.remoteRead = true;
            this.cacheWrite = false;
        };
        CachedLoaderOptions.prototype.modeAll = function () {
            this.cacheRead = true;
            this.remoteRead = true;
            this.cacheWrite = true;
        };
        CachedLoaderOptions.prototype.modeBlock = function () {
            this.cacheRead = false;
            this.remoteRead = false;
            this.cacheWrite = false;
        };
        return CachedLoaderOptions;
    })();
    xm.CachedLoaderOptions = CachedLoaderOptions;    
    var CachedLoader = (function () {
        function CachedLoader(name, service) {
            this._debug = false;
            this._options = new xm.CachedLoaderOptions();
            this._active = new xm.KeyValueMap();
            this._service = null;
            this.stats = new xm.StatCounter();
            xm.assertVar('label', name, 'string');
            xm.assertVar('service', service, 'object');
            this._service = service;
            this.stats.logger = xm.getLogger(name + '.CachedLoader');
            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedLoader.prototype.getKey = function (label, keyTerms) {
            return xm.jsonToIdent([
                label, 
                keyTerms ? keyTerms : {
                }
            ]);
        };
        CachedLoader.prototype.doCachedCall = function (label, keyTerms, opts, cachedCall) {
            var _this = this;
            var key = xm.isString(keyTerms) ? keyTerms : this.getKey(label, keyTerms);
            opts = _.defaults(opts || {
            }, this._options);
            this.stats.count('start', label);
            if(this._debug) {
                xm.log(opts);
                xm.log(key);
            }
            if(this._active.has(key)) {
                this.stats.count('active-hit');
                return this._active.get(key).then(function (content) {
                    _this.stats.count('active-resolve');
                    return content;
                }, function (err) {
                    _this.stats.count('active-error');
                    throw err;
                });
            }
            var cleanup = function () {
                _this.stats.count('active-remove');
                _this._active.remove(key);
            };
            var promise = this.cacheRead(opts, label, key).then(function (res) {
                if(!xm.isNull(res) && !xm.isUndefined(res)) {
                    _this.stats.count('cache-hit');
                    return res;
                }
                return _this.callLoad(opts, label, cachedCall).then(function (res) {
                    if(xm.isNull(res) || xm.isUndefined(res)) {
                        _this.stats.count('call-empty');
                        throw new Error('no result for: ' + label);
                    }
                    return _this.cacheWrite(opts, label, key, res).thenResolve(res);
                });
            }).then(function (res) {
                cleanup();
                _this.stats.count('complete', label);
                return res;
            }, function (err) {
                cleanup();
                _this.stats.count('error', label);
                xm.log.error(err);
                throw (err);
            });
            this.stats.count('active-set');
            this._active.set(key, promise);
            return promise;
        };
        CachedLoader.prototype.cacheRead = function (opts, label, key) {
            var _this = this;
            if(opts.cacheRead) {
                this.stats.count('read-start', label);
                return this._service.getValue(key).then(function (res) {
                    if(xm.isNull(res) || xm.isUndefined(res)) {
                        _this.stats.count('read-miss', label);
                        return null;
                    } else {
                        _this.stats.count('read-hit', label);
                        return res;
                    }
                }, function (err) {
                    _this.stats.count('read-error', label);
                    xm.log.error(err);
                    throw (err);
                });
            }
            this.stats.count('read-skip', label);
            return Q(null);
        };
        CachedLoader.prototype.callLoad = function (opts, label, cachedCall) {
            var _this = this;
            if(opts.remoteRead) {
                this.stats.count('load-start', label);
                return Q(cachedCall()).then(function (res) {
                    _this.stats.count('load-success', label);
                    return res;
                }, function (err) {
                    _this.stats.count('load-error', label);
                    xm.log.error(err);
                    throw (err);
                });
            }
            this.stats.count('load-skip', label);
            return Q(null);
        };
        CachedLoader.prototype.cacheWrite = function (opts, label, key, value) {
            var _this = this;
            if(opts.cacheWrite) {
                this.stats.count('write-start', label);
                return this._service.writeValue(key, label, value).then(function (info) {
                    _this.stats.count('write-success', label);
                    return value;
                }, function (err) {
                    _this.stats.count('write-error', label);
                    xm.log.error(err);
                    throw (err);
                });
            }
            this.stats.count('write-skip', label);
            return Q(value);
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
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var CachedJSONService = (function () {
        function CachedJSONService(dir) {
            xm.assertVar('dir', dir, 'string');
            this._store = new xm.CachedJSONStore(dir);
            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedJSONService.prototype.getCachedRaw = function (key) {
            return this._store.getValue(key);
        };
        CachedJSONService.prototype.getValue = function (key, opts) {
            return this._store.getValue(key).then(function (res) {
                if(res) {
                    return res.data;
                }
                return null;
            });
        };
        CachedJSONService.prototype.writeValue = function (key, label, value, opts) {
            var cached = new xm.CachedJSONValue(label, key, value);
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
    var uriTemplates = require('uri-templates');
    var URLManager = (function () {
        function URLManager(common) {
            this._templates = new xm.KeyValueMap();
            this._vars = {
            };
            if(common) {
                this.setVars(common);
            }
        }
        URLManager.prototype.addTemplate = function (id, url) {
            if(this._templates.has(id)) {
                throw (new Error('cannot redefine template: ' + id));
            }
            this._templates.set(id, uriTemplates(url));
        };
        URLManager.prototype.setVar = function (id, value) {
            this._vars[id] = '' + value;
        };
        URLManager.prototype.getVar = function (id) {
            if(this._vars.hasOwnProperty(id)) {
                return this._vars[id];
            }
            return null;
        };
        URLManager.prototype.setVars = function (map) {
            for(var id in map) {
                if(map.hasOwnProperty(id)) {
                    this.setVar(id, map[id]);
                }
            }
        };
        URLManager.prototype.getTemplate = function (id) {
            if(!this._templates.has(id)) {
                throw (new Error('undefined url template: ' + id));
            }
            return this._templates.get(id);
        };
        URLManager.prototype.getURL = function (id, vars) {
            if(vars) {
                var obj = {
                };
                var name;
                for(name in this._vars) {
                    if(this._vars.hasOwnProperty(name)) {
                        obj[name] = this._vars[name];
                    }
                }
                for(name in vars) {
                    if(vars.hasOwnProperty(name)) {
                        obj[name] = vars[name];
                    }
                }
                return this.getTemplate(id).fillFromObject(obj);
            }
            return this.getTemplate(id).fillFromObject(this._vars);
        };
        return URLManager;
    })();
    xm.URLManager = URLManager;    
})(xm || (xm = {}));
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var git;
(function (git) {
    var assert = require('assert');
    var _ = require('underscore');
    var GithubURLManager = (function (_super) {
        __extends(GithubURLManager, _super);
        function GithubURLManager(repo) {
                _super.call(this);
            this._base = 'https://github.com/{owner}/{project}';
            this._api = 'https://api.github.com/repos/{owner}/{project}';
            this._raw = 'https://raw.github.com/{owner}/{project}';
            xm.assertVar('repo', repo, git.GithubRepo);
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
    var GithubRepo = (function () {
        function GithubRepo(ownerName, projectName) {
            this.ownerName = ownerName;
            this.projectName = projectName;
            xm.assertVar('ownerName', ownerName, 'string');
            xm.assertVar('projectName', projectName, 'string');
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
    var GitRateLimitInfo = (function () {
        function GitRateLimitInfo() {
            this.limit = 0;
            this.remaining = 0;
            this.lastUpdate = new Date();
        }
        GitRateLimitInfo.prototype.readFromRes = function (response) {
            if(response && xm.isObject(response.meta)) {
                if(response.meta.hasOwnProperty('x-ratelimit-limit')) {
                    this.limit = parseInt(response.meta['x-ratelimit-limit'], 10);
                }
                if(response.meta.hasOwnProperty('x-ratelimit-remaining')) {
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
    var _ = require('underscore');
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var Github = require('github');
    var GithubAPICached = (function () {
        function GithubAPICached(repo, storeFolder) {
            this._apiVersion = '3.0.0';
            this._debug = false;
            xm.assertVar('repo', repo, git.GithubRepo);
            xm.assertVar('storeFolder', storeFolder, 'string');
            this._repo = repo;
            this._api = new Github({
                version: this._apiVersion
            });
            this._service = new xm.CachedJSONService(path.resolve(storeFolder, this.getCacheKey()));
            this._loader = new xm.CachedLoader('GithubAPICached', this._service);
            xm.ObjectUtil.hidePrefixed(this);
        }
        GithubAPICached.prototype.mergeParams = function (vars) {
            return _.defaults(vars || {
            }, {
                user: this._repo.ownerName,
                repo: this._repo.projectName
            });
        };
        GithubAPICached.prototype.getBranches = function () {
            var _this = this;
            var params = this.mergeParams({
            });
            return this._loader.doCachedCall('getBranches', params, {
            }, function () {
                return Q.nfcall(_this._api.repos.getBranches, params);
            });
        };
        GithubAPICached.prototype.getBranch = function (branch) {
            var _this = this;
            var params = this.mergeParams({
                branch: branch
            });
            return this._loader.doCachedCall('getBranch', params, {
            }, function () {
                return Q.nfcall(_this._api.repos.getBranch, params);
            });
        };
        GithubAPICached.prototype.getTree = function (sha, recursive) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha,
                recursive: recursive
            });
            return this._loader.doCachedCall('getTree', params, {
            }, function () {
                return Q.nfcall(_this._api.gitdata.getTree, params);
            });
        };
        GithubAPICached.prototype.getCommit = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha
            });
            return this._loader.doCachedCall('getCommit', params, {
            }, function () {
                return Q.nfcall(_this._api.gitdata.getCommit, params);
            });
        };
        GithubAPICached.prototype.getBlob = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                sha: sha,
                per_page: 100
            });
            return this._loader.doCachedCall('getBlob', params, {
            }, function () {
                return Q.nfcall(_this._api.gitdata.getBlob, params);
            });
        };
        GithubAPICached.prototype.getCommits = function (sha) {
            var _this = this;
            var params = this.mergeParams({
                per_page: 100,
                sha: sha
            });
            return this._loader.doCachedCall('getCommits', params, {
            }, function () {
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
            return this._loader.doCachedCall('getCommits', params, {
            }, function () {
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
    var Q = require('q');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var CachedFileService = (function () {
        function CachedFileService(dir) {
            xm.assertVar('dir', dir, 'string');
            this._dir = dir;
            xm.ObjectUtil.hidePrefixed(this);
        }
        CachedFileService.prototype.getValue = function (file, opts) {
            var storeFile = path.join(this._dir, file);
            return FS.exists(storeFile).then(function (exists) {
                if(exists) {
                    return FS.isFile(storeFile).then(function (isFile) {
                        if(!isFile) {
                            throw (new Error('path exists but is not a file: ' + storeFile));
                        }
                        return FS.read(storeFile);
                    });
                }
                return null;
            });
        };
        CachedFileService.prototype.writeValue = function (file, label, value, opts) {
            var storeFile = path.join(this._dir, file);
            return xm.mkdirCheckQ(path.dirname(storeFile), true).then(function () {
                return FS.write(storeFile, value);
            }).then(function () {
                return value;
            }, function (err) {
                return value;
            });
        };
        CachedFileService.prototype.getKeys = function (opts) {
            return Q([]);
        };
        Object.defineProperty(CachedFileService.prototype, "dir", {
            get: function () {
                return this._dir;
            },
            enumerable: true,
            configurable: true
        });
        return CachedFileService;
    })();
    xm.CachedFileService = CachedFileService;    
})(xm || (xm = {}));
var git;
(function (git) {
    var request = require('request');
    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');
    var GithubRawCached = (function () {
        function GithubRawCached(repo, storeFolder) {
            this._debug = false;
            this._formatVersion = '0.0.2';
            this.stats = new xm.StatCounter(false);
            xm.assertVar('repo', repo, git.GithubRepo);
            xm.assertVar('storeFolder', storeFolder, 'string');
            this._repo = repo;
            var dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);
            this._service = new xm.CachedFileService(dir);
            this._loader = new xm.CachedLoader('GithubRawCached', this._service);
            this.stats.logger = xm.getLogger('GithubRawCached');
            xm.ObjectUtil.hidePrefixed(this);
        }
        GithubRawCached.prototype.getFile = function (commitSha, filePath) {
            var _this = this;
            this.stats.count('start');
            var tmp = filePath.split(/\/|\\\//g);
            tmp.unshift(commitSha);
            var storeFile = path.join.apply(null, tmp);
            if(this._debug) {
                xm.log(storeFile);
            }
            return this._loader.doCachedCall('getFile', storeFile, {
            }, function () {
                var reqOpts = {
                    url: _this._repo.urls.rawFile(commitSha, filePath)
                };
                if(_this._debug) {
                    xm.log(reqOpts.url);
                }
                _this.stats.count('request-start');
                return Q.nfcall(request.get, reqOpts).spread(function (res) {
                    if(!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
                        _this.stats.count('request-error');
                        throw new Error('unexpected status code: ' + res.statusCode);
                    }
                    _this.stats.count('request-complete');
                    var content = String(res.body);
                    return content;
                });
            });
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
    var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;
    var leadingExp = /^\.\.\//;
    var DefUtil = (function () {
        function DefUtil() { }
        DefUtil.getDefs = function getDefs(list) {
            return list.map(function (def) {
                return def.def;
            });
        };
        DefUtil.getHeads = function getHeads(list) {
            return list.map(function (def) {
                return def.head;
            });
        };
        DefUtil.getHistoryTop = function getHistoryTop(list) {
            return list.map(function (def) {
                if(def.history.length > 0) {
                    return def.history[0];
                }
                return def.head;
            });
        };
        DefUtil.uniqueDefVersion = function uniqueDefVersion(list) {
            var ret = [];
            outer:
for(var i = 0, ii = list.length; i < ii; i++) {
                var check = list[i];
                for(var j = 0, jj = ret.length; j < jj; j++) {
                    if(check.def.path === ret[j].def.path) {
                        continue outer;
                    }
                }
                ret.push(check);
            }
            return ret;
        };
        DefUtil.uniqueDefs = function uniqueDefs(list) {
            var ret = [];
            outer:
for(var i = 0, ii = list.length; i < ii; i++) {
                var check = list[i];
                for(var j = 0, jj = ret.length; j < jj; j++) {
                    if(check.path === ret[j].path) {
                        continue outer;
                    }
                }
                ret.push(check);
            }
            return ret;
        };
        DefUtil.extractReferenceTags = function extractReferenceTags(source) {
            var ret = [];
            var match;
            if(!referenceTagExp.global) {
                throw new Error('referenceTagExp RegExp must have global flag');
            }
            referenceTagExp.lastIndex = 0;
            while((match = referenceTagExp.exec(source))) {
                if(match.length > 0 && match[1].length > 0) {
                    ret.push(match[1]);
                }
            }
            return ret;
        };
        DefUtil.contains = function contains(list, file) {
            for(var i = 0, ii = list.length; i < ii; i++) {
                if(list[i].def.path === file.def.path) {
                    return true;
                }
            }
            return false;
        };
        DefUtil.mergeDependencies = function mergeDependencies(list) {
            var ret = [];
            for(var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if(!DefUtil.contains(ret, file)) {
                    ret.push(file);
                }
                for(var j = 0, jj = file.dependencies.length; j < jj; j++) {
                    var tmp = file.dependencies[j];
                    if(!DefUtil.contains(ret, tmp)) {
                        ret.push(tmp);
                    }
                }
            }
            return ret;
        };
        DefUtil.extractDependencies = function extractDependencies(list) {
            var ret = [];
            for(var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                for(var j = 0, jj = file.dependencies.length; j < jj; j++) {
                    var tmp = file.dependencies[j];
                    if(!DefUtil.contains(ret, tmp) && !DefUtil.contains(list, tmp)) {
                        ret.push(tmp);
                    }
                }
            }
            return ret;
        };
        DefUtil.matchCommit = function matchCommit(list, commitSha) {
            var ret = [];
            for(var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if(file.commit && file.commit.commitSha === commitSha) {
                    ret.push(file);
                }
            }
            return ret;
        };
        DefUtil.haveContent = function haveContent(list) {
            var ret = [];
            for(var i = 0, ii = list.length; i < ii; i++) {
                var file = list[i];
                if(typeof file.content === 'string' && file.content.length > 0) {
                    ret.push(file);
                }
            }
            return ret;
        };
        DefUtil.fileCompare = function fileCompare(aa, bb) {
            if(!bb) {
                return 1;
            }
            if(!aa) {
                return -1;
            }
            if(aa.def.path < bb.def.path) {
                return -1;
            } else if(aa.def.path > bb.def.path) {
                return -1;
            }
            return -1;
        };
        DefUtil.defCompare = function defCompare(aa, bb) {
            if(!bb) {
                return 1;
            }
            if(!aa) {
                return -1;
            }
            if(aa.path < bb.path) {
                return -1;
            } else if(aa.path > bb.path) {
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
    var GitUserCommit = (function () {
        function GitUserCommit() { }
        GitUserCommit.prototype.toString = function () {
            return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
        };
        GitUserCommit.fromJSON = function fromJSON(json) {
            if(!json) {
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
    var GithubUser = (function () {
        function GithubUser() { }
        GithubUser.prototype.toString = function () {
            return (this.login ? this.login : '<no login>') + (this.id ? '[' + this.id + ']' : '<no id>');
        };
        GithubUser.fromJSON = function fromJSON(json) {
            if(!json) {
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
    var subjectExp = /^(.*?)[ \t]*(?:[\r\n]+|$)/;
    var GitCommitMessage = (function () {
        function GitCommitMessage(text) {
            this.parse(this.text);
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
    var pointer = require('jsonpointer.js');
    var branch_tree_sha = '/commit/commit/tree/sha';
    var DefCommit = (function () {
        function DefCommit(commitSha) {
            this._hasMeta = false;
            this.message = new git.GitCommitMessage();
            xm.assertVar('commitSha', commitSha, 'string');
            this._commitSha = commitSha;
            xm.ObjectUtil.hidePrefixed(this);
        }
        DefCommit.prototype.parseJSON = function (commit) {
            xm.assertVar('commit', commit, 'object');
            if(commit.sha !== this._commitSha) {
                throw new Error('not my tree: ' + this._commitSha + ' -> ' + commit.sha);
            }
            this._treeSha = pointer.get(commit, branch_tree_sha);
            this.hubAuthor = git.GithubUser.fromJSON(commit.author);
            this.hubCommitter = git.GithubUser.fromJSON(commit.committer);
            this.gitAuthor = git.GitUserCommit.fromJSON(commit.commit.author);
            this.gitCommitter = git.GitUserCommit.fromJSON(commit.commit.committer);
            this.message.parse(commit.commit.message);
            this._hasMeta = true;
        };
        DefCommit.prototype.hasMetaData = function () {
            return this._hasMeta;
        };
        DefCommit.prototype.toString = function () {
            return this._treeSha;
        };
        Object.defineProperty(DefCommit.prototype, "changeDate", {
            get: function () {
                if(this.gitAuthor) {
                    return this.gitAuthor.date;
                }
                if(this.gitCommitter) {
                    return this.gitCommitter.date;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefCommit.prototype, "commitShort", {
            get: function () {
                return this._commitSha ? tsd.shaShort(this._commitSha) : '<no sha>';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefCommit.prototype, "commitSha", {
            get: function () {
                return this._commitSha;
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
            this._versions = new xm.KeyValueMap();
            xm.ObjectUtil.hidePrefixed(this);
        }
        DefIndex.prototype.hasIndex = function () {
            return this._hasIndex;
        };
        DefIndex.prototype.init = function (branch, tree) {
            var _this = this;
            xm.assertVar('branch', branch, 'object');
            xm.assertVar('tree', tree, 'object');
            if(this._hasIndex) {
                return;
            }
            this._commits.clear();
            this._versions.clear();
            this._definitions.clear();
            xm.assertVar('branch', branch, 'object');
            xm.assertVar('tree', tree, 'object');
            var commitSha = pointer.get(branch, commit_sha);
            var treeSha = tree.sha;
            var sha = pointer.get(branch, branch_tree_sha);
            xm.assertVar('sha', sha, 'string');
            xm.assertVar('treeSha', treeSha, 'string');
            xm.assertVar('commitSha', commitSha, 'string');
            if(sha !== treeSha) {
                throw new Error('branch and tree sha mismatch');
            }
            this._branchName = branch.name;
            this._indexCommit = this.procureCommit(commitSha);
            this._indexCommit.parseJSON(branch.commit);
            var def;
            var file;
            tree.tree.forEach(function (elem) {
                var char = elem.path.charAt(0);
                if(elem.type === 'blob' && char !== '.' && char !== '_' && tsd.Def.isDefPath(elem.path)) {
                    def = _this.procureDef(elem.path);
                    if(!def) {
                        return;
                    }
                    file = _this.procureVersion(def, _this._indexCommit);
                    if(!file) {
                        return;
                    }
                    def.head = file;
                }
            });
            this._hasIndex = true;
        };
        DefIndex.prototype.setHistory = function (def, commitJsonArray) {
            var _this = this;
            xm.assertVar('def', def, tsd.Def);
            xm.assertVar('commits', commitJsonArray, 'array');
            def.history = [];
            commitJsonArray.map(function (json) {
                if(!json || !json.sha) {
                    xm.log.inspect(json, 'weird: json no sha');
                }
                var commit = _this.procureCommit(json.sha);
                if(!commit) {
                    xm.log.inspect('weird: no commit for sha ' + json.sha);
                    throw new Error('huh?');
                }
                commit.parseJSON(json);
                def.history.push(_this.procureVersion(def, commit));
            });
        };
        DefIndex.prototype.procureCommit = function (commitSha) {
            xm.assertVar('commitSha', commitSha, 'sha1');
            var commit;
            if(this._commits.has(commitSha)) {
                commit = this._commits.get(commitSha);
            } else {
                commit = new tsd.DefCommit(commitSha);
                this._commits.set(commitSha, commit);
            }
            return commit;
        };
        DefIndex.prototype.procureDef = function (path) {
            xm.assertVar('path', path, 'string');
            var def = null;
            if(this._definitions.has(path)) {
                def = this._definitions.get(path);
            } else {
                def = tsd.Def.getFrom(path);
                if(!def) {
                    throw new Error('cannot parse path to def: ' + path);
                }
                this._definitions.set(path, def);
            }
            return def;
        };
        DefIndex.prototype.procureVersion = function (def, commit) {
            xm.assertVar('def', def, tsd.Def);
            xm.assertVar('commit', commit, tsd.DefCommit);
            var file;
            var key = def.path + '|' + commit.commitSha;
            if(this._versions.has(key)) {
                file = this._versions.get(key);
                if(file.def !== def) {
                    throw new Error('weird: internal data mismatch: version does not belong to file: ' + file.def + ' -> ' + commit);
                }
            } else {
                file = new tsd.DefVersion(def, commit);
                this._versions.set(key, file);
            }
            return file;
        };
        DefIndex.prototype.procureVersionFromSha = function (path, commitSha) {
            xm.assertVar('path', path, 'string');
            xm.assertVar('commitSha', commitSha, 'sha1');
            var def = this.getDef(path);
            if(!def) {
                xm.log.warn('path not in index, attempt-adding: ' + path);
                def = this.procureDef(path);
            }
            if(!def) {
                throw new Error('cannot procure definition for path: ' + path);
            }
            var commit = this.procureCommit(commitSha);
            if(!commit) {
                throw new Error('cannot procure commit for path: ' + path + ' -> commit: ' + commitSha);
            }
            if(!commit.hasMetaData()) {
            }
            var file = this.procureVersion(def, commit);
            if(!file) {
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
    var expTrim = /^\/(.*)\/([a-z]+)*$/gm;
    var flagFilter = /[gim]/;
    var RegExpGlue = (function () {
        function RegExpGlue() {
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            this.parts = [];
            if(exp.length > 0) {
                this.append.apply(this, exp);
            }
        }
        RegExpGlue.get = function get() {
            var exp = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                exp[_i] = arguments[_i + 0];
            }
            var e = new RegExpGlue();
            return e.append.apply(e, exp);
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
            if(!trim) {
                return '';
            }
            return typeof trim[1] !== 'undefined' ? trim[1] : '';
        };
        RegExpGlue.prototype.getFlags = function (exp) {
            expTrim.lastIndex = 0;
            var trim = expTrim.exec('' + exp);
            if(!trim) {
                return '';
            }
            return typeof trim[2] !== 'undefined' ? this.getCleanFlags(trim[2]) : '';
        };
        RegExpGlue.prototype.getCleanFlags = function (flags) {
            var ret = '';
            for(var i = 0; i < flags.length; i++) {
                var char = flags.charAt(i);
                if(flagFilter.test(char) && ret.indexOf(char) < 0) {
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
                if(typeof exp === 'string') {
                    chunks.push(exp);
                    return;
                }
                expTrim.lastIndex = 0;
                var trim = expTrim.exec('' + exp);
                if(!trim) {
                    return exp;
                }
                if(trim.length < 2) {
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
var xm;
(function (xm) {
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
            var ret = {
            };
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
                    if(p) {
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
                if(!_this.parsers.has(id)) {
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
            while(line = trimmedLine.exec(source)) {
                log('-----------------------------------------------------------------------------------------');
                if(line[0].length === 0) {
                    console.log('zero length line match?');
                    break;
                }
                if(line.index + line[0].lengt === cursor) {
                    console.log('cursor not advancing?');
                    break;
                }
                cursor = line.index + line[0].length;
                trimmedLine.lastIndex = cursor;
                lineCount++;
                log('line: ' + lineCount);
                if(lineCount > safetyBreak) {
                    console.log('\n\n\n\nsafetyBreak bail at ' + lineCount + '> ' + safetyBreak + '!\n\n\n\n\n');
                    throw ('parser safetyBreak bail!');
                }
                if(line.length < 5) {
                    log('skip bad line match');
                } else if(typeof line[2] === 'undefined' || line[2] === '') {
                    log('skip empty line');
                } else {
                    procLineCount++;
                    var text = line[2];
                    log('[[' + text + ']]');
                    log('---');
                    var choice = [];
                    for(i = 0 , ii = possibles.length; i < ii; i++) {
                        var parser = possibles[i];
                        var match = parser.match(text, offset, cursor);
                        if(match) {
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
                    if(choice.length === 0) {
                        log('cannot match line');
                        break;
                    } else if(choice.length === 1) {
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
                if(possibles.length === 0) {
                    log('no more possibles, break');
                    break;
                }
                if(cursor >= length) {
                    log('done ' + cursor + ' >= ' + length + ' lineCount: ' + lineCount);
                    break;
                }
            }
            log('--------------');
            log('total lineCount: ' + lineCount);
            log('procLineCount: ' + procLineCount);
            log('res.length: ' + res.length);
            log(' ');
            if(res.length > 0) {
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
            if(!match || match.length < 1) {
                return null;
            }
            if(this.groupsMin >= 0 && match.length < this.groupsMin) {
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
            if(this.parser.callback) {
                this.parser.callback(this);
            }
        };
        LineParserMatch.prototype.getGroup = function (num, alt) {
            if (typeof alt === "undefined") { alt = ''; }
            if(num >= this.match.length - 1) {
                throw (new Error(this.parser.getName() + ' group index ' + num + ' > ' + (this.match.length - 2)));
            }
            num += 1;
            if(num < 1 || num > this.match.length) {
                return alt;
            }
            if(typeof this.match[num] === 'undefined') {
                return alt;
            }
            return this.match[num];
        };
        LineParserMatch.prototype.getGroupFloat = function (num, alt) {
            if (typeof alt === "undefined") { alt = 0; }
            var value = parseFloat(this.getGroup(num));
            if(isNaN(value)) {
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
    var endSlashTrim = /\/?$/;
    var AuthorInfo = (function () {
        function AuthorInfo(name, url, email) {
            if (typeof name === "undefined") { name = ''; }
            if (typeof url === "undefined") { url = null; }
            if (typeof email === "undefined") { email = null; }
            this.name = name;
            this.url = url;
            this.email = email;
            if(this.url) {
                this.url = this.url.replace(endSlashTrim, '');
            }
        }
        AuthorInfo.prototype.toString = function () {
            return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
        };
        AuthorInfo.prototype.toJSON = function () {
            var obj = {
                name: this.name
            };
            if(this.url) {
                obj.url = this.url;
            }
            if(this.email) {
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
        if(add) {
            for(i = 0 , ii = add.length; i < ii; i++) {
                res.push(add[i]);
            }
        }
        if(remove) {
            for(i = 0 , ii = remove.length; i < ii; i++) {
                while((index = res.indexOf(remove[i])) > -1) {
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
            var fields = [
                'projectUrl', 
                'defAuthorUrl', 
                'defAuthorUrlAlt', 
                'reposUrl', 
                'reposUrlAlt', 
                'referencePath'
            ];
            this.parser.addParser(new xm.LineParser('any', anyGreedyCap, 0, null, [
                'head', 
                'any'
            ]));
            this.parser.addParser(new xm.LineParser('head', typeHead, 2, function (match) {
                data.name = match.getGroup(0, data.name);
                data.version = match.getGroup(1, data.version);
            }, fields));
            fields = mutate(fields, null, [
                'projectUrl'
            ]);
            this.parser.addParser(new xm.LineParser('projectUrl', projectUrl, 1, function (match) {
                data.projectUrl = match.getGroup(0, data.projectUrl).replace(endSlashTrim, '');
            }, fields));
            fields = mutate(fields, [
                'defAuthorAppend'
            ], [
                'defAuthorUrl', 
                'defAuthorUrlAlt'
            ]);
            this.parser.addParser(new xm.LineParser('defAuthorUrl', defAuthorUrl, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));
            this.parser.addParser(new xm.LineParser('defAuthorUrlAlt', defAuthorUrlAlt, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));
            this.parser.addParser(new xm.LineParser('defAuthorAppend', wordsUrl, 2, function (match) {
                data.authors.push(new xm.AuthorInfo(match.getGroup(0), match.getGroup(1)));
            }, fields));
            fields = mutate(fields, null, [
                'defAuthorAppend'
            ]);
            fields = mutate(fields, null, [
                'reposUrl', 
                'reposUrlAlt'
            ]);
            this.parser.addParser(new xm.LineParser('reposUrl', reposUrl, 1, function (match) {
                data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
            }, fields));
            this.parser.addParser(new xm.LineParser('reposUrlAlt', reposUrlAlt, 1, function (match) {
                data.reposUrl = match.getGroup(0, data.reposUrl).replace(endSlashTrim, '');
            }, fields));
            this.parser.addParser(new xm.LineParser('referencePath', referencePath, 1, function (match) {
                data.references.push(match.getGroup(0));
            }, [
                'referencePath'
            ]));
            this.parser.addParser(new xm.LineParser('comment', commentLine, 0, null, [
                'comment'
            ]));
            if(this.verbose) {
                xm.log(this.parser.getInfo());
            }
            this.parser.parse(source, [
                'head'
            ]);
        };
        return DefInfoParser;
    })();
    tsd.DefInfoParser = DefInfoParser;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Q = require('q');
    var leadingExp = /^\.\.\//;
    var Resolver = (function () {
        function Resolver(core) {
            this._active = new xm.KeyValueMap();
            this.stats = new xm.StatCounter();
            xm.assertVar('core', core, tsd.Core);
            this._core = core;
            this.stats.log = this._core.context.verbose;
            this.stats.logger = xm.getLogger('Resolver');
            xm.ObjectUtil.hidePrefixed(this);
        }
        Resolver.prototype.resolveBulk = function (list) {
            var _this = this;
            list = tsd.DefUtil.uniqueDefVersion(list);
            return Q.all(list.map(function (file) {
                return _this.resolve(file);
            })).thenResolve(list);
        };
        Resolver.prototype.resolve = function (file) {
            var _this = this;
            if(file.solved) {
                this.stats.count('solved-early');
                return Q(file);
            }
            if(this._active.has(file.key)) {
                this.stats.count('active-has');
                return this._active.get(file.key);
            } else {
                this.stats.count('active-miss');
            }
            var promise = this._core.loadContent(file).then(function (file) {
                _this.stats.count('file-parse');
                file.dependencies = [];
                var refs = tsd.DefUtil.extractReferenceTags(file.content);
                refs = refs.reduce(function (memo, refPath) {
                    refPath = refPath.replace(leadingExp, '');
                    if(refPath.indexOf('/') < 0) {
                        refPath = file.def.project + '/' + refPath;
                    }
                    if(tsd.Def.isDefPath(refPath)) {
                        memo.push(refPath);
                    } else {
                        xm.log.warn('not a reference: ' + refPath);
                    }
                    return memo;
                }, []);
                var queued = refs.reduce(function (memo, refPath) {
                    if(_this._core.index.hasDef(refPath)) {
                        var dep = _this._core.index.getDef(refPath).head;
                        file.dependencies.push(dep);
                        _this.stats.count('dep-added');
                        if(!dep.solved && !_this._active.has(dep.key)) {
                            _this.stats.count('dep-recurse');
                            memo.push(_this.resolve(dep));
                        }
                    } else {
                        xm.log.warn('path reference not in index: ' + refPath);
                    }
                    return memo;
                }, []);
                file.solved = true;
                _this._active.remove(file.key);
                _this.stats.count('active-remove');
                if(queued.length > 0) {
                    _this.stats.count('subload-start');
                    return Q.all(queued);
                }
                return Q(file);
            }).thenResolve(file);
            this.stats.count('active-set');
            this._active.set(file.key, promise);
            return promise;
        };
        return Resolver;
    })();
    tsd.Resolver = Resolver;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Q = require('q');
    var FS = require('q-io/fs');
    var fs = require('fs');
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
            xm.assertVar('context', context, tsd.Context);
            this.resolver = new tsd.Resolver(this);
            this.index = new tsd.DefIndex();
            this.gitRepo = new git.GithubRepo(this.context.config.repoOwner, this.context.config.repoProject);
            this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git_api'));
            this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(this.context.paths.cacheDir, 'git_raw'));
            this.stats.logger = xm.getLogger('Core.stats');
            this.debug = context.verbose;
            xm.ObjectUtil.hidePrefixed(this);
        }
        Core.prototype.getIndex = function () {
            var _this = this;
            this.stats.count('index-start');
            if(this.index.hasIndex()) {
                this.stats.count('index-hit');
                return Q(this.index);
            }
            this.stats.count('index-miss');
            var branchData;
            this.stats.count('index-branch-get');
            return this.gitAPI.getBranch(this.context.config.ref).then(function (data) {
                var sha = pointer.get(data, branch_tree);
                if(!sha) {
                    _this.stats.count('index-branch-get-fail');
                    throw new Error('missing sha hash');
                }
                _this.stats.count('index-branch-get-success');
                _this.stats.count('index-tree-get');
                branchData = data;
                return _this.gitAPI.getTree(sha, true);
            }, function (err) {
                _this.stats.count('index-branch-get-error');
                throw err;
            }).then(function (data) {
                _this.stats.count('index-tree-get-success');
                _this.index.init(branchData, data);
                return _this.index;
            }, function (err) {
                _this.stats.count('index-tree-get-error');
                throw err;
            });
        };
        Core.prototype.select = function (selector) {
            var _this = this;
            var result = new tsd.APIResult(this.index, selector);
            return this.getIndex().then(function () {
                result.nameMatches = selector.pattern.filter(_this.index.list);
                result.selection = tsd.DefUtil.getHeads(result.nameMatches);
                if(selector.resolveDependencies) {
                    return _this.resolveDepencendiesBulk(result.selection);
                }
                return null;
            }).thenResolve(result);
        };
        Core.prototype.procureDef = function (path) {
            var _this = this;
            return this.getIndex().then(function () {
                var def = _this.index.procureDef(path);
                if(!def) {
                    return Q.reject(new Error('cannot get def for path: ' + path));
                }
                return Q(def);
            });
        };
        Core.prototype.procureFile = function (path, commitSha) {
            var _this = this;
            return this.getIndex().then(function () {
                var file = _this.index.procureVersionFromSha(path, commitSha);
                if(!file) {
                    return Q.reject(new Error('cannot get file for path: ' + path));
                }
                return Q(file);
            });
        };
        Core.prototype.procureCommit = function (commitSha) {
            var _this = this;
            return this.getIndex().then(function () {
                var commit = _this.index.procureCommit(commitSha);
                if(!commit) {
                    return Q.reject(new Error('cannot commit def for commitSha: ' + path));
                }
                return Q(commit);
            });
        };
        Core.prototype.findFile = function (path, commitShaFragment) {
            return Q.reject('implement me!');
        };
        Core.prototype.installFile = function (file, addToConfig) {
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            var _this = this;
            return this.useFile(file).then(function (targetPath) {
                if(_this.context.config.hasFile(file.def.path)) {
                    _this.context.config.getFile(file.def.path).update(file);
                } else if(addToConfig) {
                    _this.context.config.addFile(file);
                }
                return targetPath;
            });
        };
        Core.prototype.installFileBulk = function (list, addToConfig) {
            if (typeof addToConfig === "undefined") { addToConfig = true; }
            var _this = this;
            var written = new xm.KeyValueMap();
            return Q.all(list.map(function (file) {
                return _this.installFile(file, addToConfig).then(function (targetPath) {
                    written.set(targetPath, file);
                });
            })).thenResolve(written);
        };
        Core.prototype.readConfig = function (optional) {
            if (typeof optional === "undefined") { optional = false; }
            var _this = this;
            return FS.exists(this.context.paths.configFile).then(function (exists) {
                if(!exists) {
                    if(!optional) {
                        throw new Error('cannot locate file: ' + _this.context.paths.configFile);
                    }
                    return null;
                }
                return xm.FileUtil.readJSONPromise(_this.context.paths.configFile).then(function (json) {
                    _this.context.config.parseJSON(json);
                    return null;
                });
            });
        };
        Core.prototype.saveConfig = function () {
            var file = this.context.paths.configFile;
            var json = JSON.stringify(this.context.config.toJSON(), null, 2);
            var dir = path.dirname(file);
            if(!json || json.length === 0) {
                return Q.reject(new Error('saveConfig retrieved empty json'));
            }
            return xm.mkdirCheckQ(dir, true).then(function () {
                return FS.write(file, json).then(function () {
                    return FS.stat(file);
                }).then(function () {
                    return Q.delay(100);
                }).then(function () {
                    return FS.stat(file).then(function (stat) {
                        if(stat.size === 0) {
                            throw new Error('saveConfig write zero bytes to: ' + file);
                        }
                    });
                });
            }).thenResolve(file);
        };
        Core.prototype.reinstallBulk = function (list) {
            var _this = this;
            var written = new xm.KeyValueMap();
            return Q.all(list.map(function (installed) {
                return _this.procureFile(installed.path, installed.commitSha).then(function (file) {
                    return _this.installFile(file, true).then(function (targetPath) {
                        written.set(targetPath, file);
                        return file;
                    });
                });
            })).thenResolve(written);
        };
        Core.prototype.loadCommitMetaData = function (commit) {
            if(commit.hasMetaData()) {
                return Q(commit);
            }
            return this.gitAPI.getCommit(commit.commitSha).then(function (json) {
                commit.parseJSON(json);
                return commit;
            });
        };
        Core.prototype.loadContent = function (file) {
            if(file.content) {
                return Q(file.content);
            }
            return this.gitRaw.getFile(file.commit.commitSha, file.def.path).then(function (content) {
                file.content = String(content);
                return file;
            });
        };
        Core.prototype.loadContentBulk = function (list) {
            var _this = this;
            return Q.all(list.map(function (file) {
                return _this.loadContent(file);
            })).thenResolve(list);
        };
        Core.prototype.loadHistory = function (file) {
            var _this = this;
            if(file.history.length > 0) {
                return Q(file);
            }
            return this.gitAPI.getPathCommits(this.context.config.ref, file.path).then(function (content) {
                _this.index.setHistory(file, content);
                return file;
            });
        };
        Core.prototype.loadHistoryBulk = function (list) {
            var _this = this;
            list = tsd.DefUtil.uniqueDefs(list);
            return Q.all(list.map(function (file) {
                return _this.loadHistory(file);
            })).thenResolve(list);
        };
        Core.prototype.resolveDepencendies = function (file) {
            return this.resolver.resolve(file);
        };
        Core.prototype.resolveDepencendiesBulk = function (list) {
            return this.resolver.resolveBulk(list);
        };
        Core.prototype.parseDefInfo = function (file) {
            var _this = this;
            return this.loadContent(file).then(function (file) {
                var parser = new tsd.DefInfoParser(_this.context.verbose);
                if(file.info) {
                    file.info.resetFields();
                } else {
                    file.info = new tsd.DefInfo();
                }
                parser.parse(file.info, file.content);
                if(!file.info.isValid()) {
                    _this.log.warn('bad parse in: ' + file);
                }
                return file;
            });
        };
        Core.prototype.parseDefInfoBulk = function (list) {
            var _this = this;
            list = tsd.DefUtil.uniqueDefVersion(list);
            return Q.all(list.map(function (file) {
                return _this.parseDefInfo(file);
            })).thenResolve(list);
        };
        Core.prototype.useFile = function (file, overwrite) {
            if (typeof overwrite === "undefined") { overwrite = true; }
            var _this = this;
            var targetPath = path.resolve(this.context.config.typingsPath, file.def.path);
            var dir = path.dirname(targetPath);
            return FS.exists(targetPath).then(function (exists) {
                if(exists && !overwrite) {
                    return null;
                }
                return _this.loadContent(file).then(function () {
                    return FS.exists(targetPath);
                }).then(function (exists) {
                    if(exists) {
                        return FS.remove(targetPath);
                    }
                    return xm.mkdirCheckQ(dir, true);
                }).then(function () {
                    return FS.write(targetPath, file.content);
                }).then(function () {
                    return targetPath;
                });
            });
        };
        Core.prototype.useFileBulk = function (list, overwrite) {
            if (typeof overwrite === "undefined") { overwrite = true; }
            var _this = this;
            list = tsd.DefUtil.uniqueDefVersion(list);
            var written = new xm.KeyValueMap();
            return Q.all(list.map(function (file) {
                return _this.useFile(file, overwrite).then(function (targetPath) {
                    written.set(targetPath, file);
                });
            })).thenResolve(written);
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
    var wordParts = /[\w_\.-]/;
    var wordGreedy = /[\w_\.-]+/;
    var wordLazy = /[\w_\.-]*?/;
    var wordGlob = /(\**)([\w_\.-]*?)(\**)/;
    var patternSplit = xm.RegExpGlue.get('^', wordGlob, '/', wordGlob, '$').join();
    var patternSingle = xm.RegExpGlue.get('^', wordGlob, '$').join();
    function escapeExp(str) {
        return str.replace('.', '\\.');
    }
    var NameMatcher = (function () {
        function NameMatcher(pattern) {
            xm.assertVar('pattern', pattern, 'string');
            this.pattern = pattern;
        }
        NameMatcher.prototype.filter = function (list) {
            return list.filter(this.getFilterFunc(), this);
        };
        NameMatcher.prototype.toString = function () {
            return this.pattern;
        };
        NameMatcher.prototype.compile = function () {
            if(!this.pattern) {
                throw (new Error('NameMatcher undefined pattern'));
            }
            this.projectExp = null;
            this.nameExp = null;
            if(this.pattern.indexOf('/') > -1) {
                this.compileSplit();
            } else {
                this.compileSingle();
            }
        };
        NameMatcher.prototype.compileSingle = function () {
            patternSingle.lastIndex = 0;
            var match = patternSingle.exec(this.pattern);
            if(match.length < 4) {
                throw (new Error('NameMatcher bad match: "' + match + '"'));
            }
            var glue;
            var gotMatch = false;
            glue = xm.RegExpGlue.get('^');
            if(match[1].length > 0) {
                glue.append(wordLazy);
                gotMatch = true;
            }
            if(match[2].length > 0) {
                glue.append(escapeExp(match[2]));
                gotMatch = true;
            }
            if(match[3].length > 0) {
                glue.append(wordLazy);
                gotMatch = true;
            }
            if(gotMatch) {
                glue.append('$');
                this.nameExp = glue.join('i');
            }
        };
        NameMatcher.prototype.compileSplit = function () {
            patternSplit.lastIndex = 0;
            var match = patternSplit.exec(this.pattern);
            if(match.length < 7) {
                throw (new Error('NameMatcher bad match: "' + match + '"'));
            }
            var glue;
            var gotProject = false;
            glue = xm.RegExpGlue.get('^');
            if(match[1].length > 0) {
                glue.append(wordLazy);
            }
            if(match[2].length > 0) {
                glue.append(escapeExp(match[2]));
                gotProject = true;
            }
            if(match[3].length > 0) {
                glue.append(wordLazy);
            }
            if(gotProject) {
                glue.append('$');
                this.projectExp = glue.join('i');
            }
            var gotFile = false;
            glue = xm.RegExpGlue.get('^');
            if(match[4].length > 0) {
                glue.append(wordLazy);
            }
            if(match[5].length > 0) {
                glue.append(escapeExp(match[5]));
                gotFile = true;
            }
            if(match[6].length > 0) {
                glue.append(wordLazy);
            }
            if(gotFile) {
                glue.append('$');
                this.nameExp = glue.join('i');
            }
        };
        NameMatcher.prototype.getFilterFunc = function () {
            var _this = this;
            this.compile();
            if(this.nameExp) {
                if(this.projectExp) {
                    return function (file) {
                        return _this.projectExp.test(file.project) && _this.nameExp.test(file.name);
                    };
                } else {
                    return function (file) {
                        return _this.nameExp.test(file.name);
                    };
                }
            } else if(this.projectExp) {
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
    var InfoMatcher = (function () {
        function InfoMatcher() { }
        InfoMatcher.prototype.test = function (info) {
            return true;
        };
        return InfoMatcher;
    })();
    tsd.InfoMatcher = InfoMatcher;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Selector = (function () {
        function Selector(pattern) {
            if (typeof pattern === "undefined") { pattern = '*'; }
            this.resolveDependencies = false;
            this.limit = 10;
            xm.assertVar('pattern', pattern, 'string');
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
var tsd;
(function (tsd) {
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
            xm.assertVar('index', index, tsd.DefIndex);
            xm.assertVar('selector', selector, tsd.Selector, true);
        }
        return APIResult;
    })();
    tsd.APIResult = APIResult;    
    var API = (function () {
        function API(context) {
            this.context = context;
            xm.assertVar('context', context, tsd.Context);
            this._core = new tsd.Core(this.context);
            xm.ObjectUtil.hidePrefixed(this);
        }
        API.prototype.readConfig = function (optional) {
            return this._core.readConfig(optional).thenResolve(null);
        };
        API.prototype.saveConfig = function () {
            return this._core.saveConfig().thenResolve(null);
        };
        API.prototype.search = function (selector) {
            xm.assertVar('selector', selector, tsd.Selector);
            return this._core.select(selector);
        };
        API.prototype.install = function (selector) {
            var _this = this;
            xm.assertVar('selector', selector, tsd.Selector);
            selector.resolveDependencies = true;
            return this._core.select(selector).then(function (res) {
                var files = res.selection;
                files = tsd.DefUtil.mergeDependencies(files);
                return _this._core.installFileBulk(files).then(function (written) {
                    if(!written) {
                        throw new Error('expected install paths');
                    }
                    res.written = written;
                    return _this._core.saveConfig();
                }).thenResolve(res);
            });
        };
        API.prototype.directInstall = function (path, commitSha) {
            var _this = this;
            xm.assertVar('path', path, 'string');
            xm.assertVar('commitSha', commitSha, 'sha1');
            var res = new tsd.APIResult(this._core.index, null);
            return this._core.procureFile(path, commitSha).then(function (file) {
                return _this._core.installFile(file).then(function (targetPath) {
                    res.written.set(targetPath, file);
                    return null;
                });
            }).thenResolve(res);
        };
        API.prototype.installFragment = function (path, commitShaFragment) {
            var _this = this;
            xm.assertVar('path', path, 'string');
            var res = new tsd.APIResult(this._core.index, null);
            return this._core.findFile(path, commitShaFragment).then(function (file) {
                return _this._core.installFile(file).then(function (targetPath) {
                    res.written.set(targetPath, file);
                    return res;
                });
            }).thenResolve(res);
        };
        API.prototype.info = function (selector) {
            var _this = this;
            xm.assertVar('selector', selector, tsd.Selector);
            return this._core.select(selector).then(function (res) {
                return _this._core.parseDefInfoBulk(res.selection).thenResolve(res);
            });
        };
        API.prototype.history = function (selector) {
            var _this = this;
            xm.assertVar('selector', selector, tsd.Selector);
            return this._core.select(selector).then(function (res) {
                res.definitions = tsd.DefUtil.getDefs(res.selection);
                return _this._core.loadHistoryBulk(res.definitions).thenResolve(res);
            });
        };
        API.prototype.deps = function (selector) {
            var _this = this;
            xm.assertVar('selector', selector, tsd.Selector);
            return this._core.select(selector).then(function (res) {
                return _this._core.resolveDepencendiesBulk(res.selection).thenResolve(res);
            });
        };
        API.prototype.reinstall = function () {
            var res = new tsd.APIResult(this._core.index, null);
            return this._core.reinstallBulk(this.context.config.getInstalled()).then(function (map) {
                res.written = map;
                return res;
            }).thenResolve(res);
        };
        API.prototype.compare = function (selector) {
            xm.assertVar('selector', selector, tsd.Selector);
            return Q.reject(new Error('not implemented yet'));
        };
        API.prototype.update = function (selector) {
            xm.assertVar('selector', selector, tsd.Selector);
            return Q.reject(new Error('not implemented yet'));
        };
        API.prototype.purge = function () {
            return Q.reject(new Error('not implemented yet'));
        };
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
    var Set = (function () {
        function Set(values) {
            this._content = [];
            if(values) {
                this.import(values);
            }
        }
        Set.prototype.has = function (value) {
            return this._content.indexOf(value) > -1;
        };
        Set.prototype.add = function (value) {
            if(this._content.indexOf(value) < 0) {
                this._content.push(value);
            }
        };
        Set.prototype.remove = function (value) {
            var i = this._content.indexOf(value);
            if(i > -1) {
                this._content.splice(i, 1);
            }
        };
        Set.prototype.values = function () {
            return this._content.slice(0);
        };
        Set.prototype.import = function (values) {
            for(var i = 0, ii = values.length; i < ii; i++) {
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
    function shaShort(sha) {
        return sha.substr(0, tsd.Const.shaShorten);
    }
    tsd.shaShort = shaShort;
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    var optimist = require('optimist');
    var Table = require('easy-table');
    var ExposeCommand = (function () {
        function ExposeCommand(id, execute, label, options, variadic) {
            if (typeof options === "undefined") { options = []; }
            if (typeof variadic === "undefined") { variadic = []; }
            this.id = id;
            this.execute = execute;
            this.label = label;
            this.options = options;
            this.variadic = variadic;
        }
        ExposeCommand.prototype.init = function () {
        };
        return ExposeCommand;
    })();
    xm.ExposeCommand = ExposeCommand;    
    var Expose = (function () {
        function Expose(title) {
            if (typeof title === "undefined") { title = ''; }
            this.title = title;
            var _this = this;
            this._commands = new xm.KeyValueMap();
            this._options = new xm.KeyValueMap();
            this._isInit = false;
            this._nodeBin = false;
            this.command('help', function () {
                _this.printCommands();
            }, 'Display usage help');
            this.defineOption({
                name: 'help',
                short: 'h',
                description: 'Display usage help',
                type: 'flag',
                default: null,
                placeholder: null,
                command: 'help',
                global: true
            });
            xm.ObjectUtil.hidePrefixed(this);
        }
        Expose.prototype.defineOption = function (data) {
            if(this._options.has(data.name)) {
                throw new Error('option id collision on ' + data.name);
            }
            this._options.set(data.name, data);
        };
        Expose.prototype.command = function (id, def, label, options, variadic) {
            if(this._commands.has(id)) {
                throw new Error('id collision on ' + id);
            }
            this._commands.set(id, new ExposeCommand(id, def, label, options, variadic));
        };
        Expose.prototype.init = function () {
            var _this = this;
            if(this._isInit) {
                return;
            }
            this._isInit = true;
            xm.eachProp(this._options.keys(), function (id) {
                var option = _this._options.get(id);
                if(option.short) {
                    optimist.alias(option.name, option.short);
                }
                if(option.type === 'flag') {
                    optimist.boolean(option.name);
                } else if(option.type === 'string') {
                    optimist.string(option.name);
                }
                if(option.hasOwnProperty('default')) {
                    optimist.default(option.name, option.default);
                }
            });
            xm.eachProp(this._commands.keys(), function (id) {
                _this._commands.get(id).init();
            });
        };
        Expose.prototype.executeArgv = function (argvRaw, alt) {
            this.init();
            this._nodeBin = argvRaw[0] === 'node';
            var options = this._options.values();
            var opt;
            var i, ii;
            var argv = optimist.parse(argvRaw);
            if(!argv || argv._.length === 0) {
                if(alt && this._commands.has(alt)) {
                    this.execute(alt, argv);
                } else {
                    this.execute('help', argv);
                }
                return;
            }
            for(i = 0 , ii = options.length; i < ii; i++) {
                opt = options[i];
                if(opt.command && argv[opt.name]) {
                    this.execute(opt.command, argv);
                    return;
                }
            }
            var cmd = argv._.shift();
            if(cmd === 'node') {
                argv._.shift();
            }
            cmd = argv._.shift();
            if(typeof cmd === 'undefined') {
                if(alt && this._commands.has(alt)) {
                    xm.log.warn('undefined command, using default');
                    xm.log('');
                    this.execute(alt, argv);
                } else {
                    xm.log.warn('undefined command');
                    xm.log('');
                    this.execute('help', argv);
                }
            } else if(this._commands.has(cmd)) {
                this.execute(cmd, argv);
            } else {
                xm.log.warn('command not found: ' + cmd);
                xm.log('');
                this.execute('help', argv, false);
            }
        };
        Expose.prototype.execute = function (id, args, head) {
            if (typeof args === "undefined") { args = null; }
            if (typeof head === "undefined") { head = false; }
            this.init();
            if(!this._commands.has(id)) {
                xm.log.error('\nunknown command ' + id + '\n');
                return;
            }
            if(head) {
                xm.log('\n-> ' + id + '\n');
            }
            var f = this._commands.get(id);
            f.execute.call(f, args);
        };
        Expose.prototype.printCommands = function () {
            var _this = this;
            if(this.title) {
                xm.log(this.title + '\n');
            }
            var optionString = function (option) {
                var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
                return (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
            };
            var globalOpts = new Table();
            var commandOptNames = [];
            var globalOptNames = [];
            var commandPadding = '   ';
            var optPadding = '      ';
            var optKeys = this._options.keys().sort();
            var options = this._options.values();
            xm.eachElem(optKeys, function (name) {
                var option = _this._options.get(name);
                if(option.command) {
                    globalOpts.cell('one', optPadding + optionString(option));
                    globalOpts.cell('two', option.description);
                    globalOpts.newRow();
                    commandOptNames.push(option.name);
                }
            });
            globalOpts.newRow();
            xm.eachElem(optKeys, function (name) {
                var option = _this._options.get(name);
                if(option.global && !option.command) {
                    globalOpts.cell('one', optPadding + optionString(option));
                    globalOpts.cell('two', option.description);
                    globalOpts.newRow();
                    globalOptNames.push(option.name);
                }
            });
            var commands = new Table();
            xm.eachProp(this._commands.keys().sort(), function (id) {
                var usage = id;
                var cmd = _this._commands.get(id);
                if(cmd.variadic.length > 0) {
                    usage += ' <' + cmd.variadic.join(', ') + '>';
                }
                commands.cell('one', commandPadding + usage);
                commands.cell('two', cmd.label);
                commands.newRow();
                xm.eachProp(cmd.options, function (name) {
                    var option = _this._options.get(name);
                    if(commandOptNames.indexOf(name) < 0) {
                        commands.cell('one', optPadding + optionString(option));
                        commands.cell('two', option.description);
                        commands.newRow();
                    }
                });
                commands.newRow();
            });
            xm.log('commands:\n----');
            xm.log(commands.print());
            if(globalOptNames.length > 0) {
                xm.log('global options:\n----');
                xm.log(globalOpts.print());
            }
        };
        Expose.prototype.hasCommand = function (id) {
            return this._commands.has(id);
        };
        Expose.prototype.getCommand = function (id) {
            return this._commands.get(id);
        };
        Object.defineProperty(Expose.prototype, "nodeBin", {
            get: function () {
                return this._nodeBin;
            },
            enumerable: true,
            configurable: true
        });
        return Expose;
    })();
    xm.Expose = Expose;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    function pad(number) {
        var r = String(number);
        if(r.length === 1) {
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
    var path = require('path');
    var Q = require('q');
    var FS = require('q-io/fs');
    function getContext(args) {
        xm.assertVar('args', args, 'object');
        var context = new tsd.Context(args.config, args.verbose);
        if(args.dev) {
            context.paths.cacheDir = path.resolve(path.dirname(xm.PackageJSON.find()), tsd.Const.cacheDir);
        } else {
            context.paths.cacheDir = tsd.Paths.getUserCacheDir();
        }
        return context;
    }
    var defaultJobOptions = [
        'config'
    ];
    function jobOptions(merge) {
        if (typeof merge === "undefined") { merge = []; }
        return defaultJobOptions.concat(merge);
    }
    var Job = (function () {
        function Job() { }
        return Job;
    })();    
    function getAPIJob(args) {
        return Q.fcall(function () {
            if(args.config) {
                return FS.isFile(args.config).then(function (isFile) {
                    if(!isFile) {
                        throw new Error('specified config is not a file: ' + args.config);
                    }
                    return null;
                });
            }
            return null;
        }).then(function () {
            var job = new Job();
            job.context = getContext(args);
            job.api = new tsd.API(job.context);
            var required = (typeof args.config !== undefined ? true : false);
            return job.api.readConfig(required).then(function () {
                return job;
            });
        });
    }
    function getSelectorJob(args) {
        return getAPIJob(args).then(function (job) {
            if(args._.length !== 1) {
                throw new Error('pass one selector pattern');
            }
            job.selector = new tsd.Selector(args._[0]);
            return job;
        });
    }
    function runARGV(argvRaw) {
        var expose = new xm.Expose(xm.PackageJSON.getLocal().getNameVersion());
        expose.defineOption({
            name: 'version',
            short: 'V',
            description: 'Display version information',
            type: 'flag',
            default: null,
            placeholder: null,
            command: 'version',
            global: true
        });
        expose.defineOption({
            name: 'config',
            description: 'Path to config file',
            short: 'c',
            type: 'string',
            default: null,
            placeholder: 'path',
            command: null,
            global: false
        });
        expose.defineOption({
            name: 'verbose',
            short: null,
            description: 'Verbose output',
            type: 'flag',
            default: false,
            placeholder: null,
            command: null,
            global: true
        });
        expose.defineOption({
            name: 'dev',
            short: null,
            description: 'Development mode',
            type: 'flag',
            default: null,
            placeholder: null,
            command: null,
            global: true
        });
        function reportError(err) {
            xm.log('-> ' + 'an error occured!'.red);
            xm.log('');
            if(err.stack) {
                xm.log(err.stack);
            } else {
                xm.log(String(err));
            }
        }
        function reportSucces(result) {
            xm.log('');
            xm.log('-> ' + 'success!'.green);
            if(result) {
                xm.assertVar('result', result, tsd.APIResult);
                xm.log('');
                result.selection.forEach(function (def) {
                    xm.log(def.toString());
                    if(def.info) {
                        xm.log(def.info.toString());
                        xm.log(def.info);
                    }
                });
            }
        }
        function printSubHead(text) {
            xm.log(' ' + text);
            xm.log('----');
        }
        function printDefHead(def) {
            xm.log('');
            xm.log(def.toString());
            xm.log('----');
        }
        function printFileHead(file) {
            xm.log('');
            xm.log(file.toString());
            xm.log('----');
        }
        function printFileCommit(file, skipNull) {
            if (typeof skipNull === "undefined") { skipNull = false; }
            if(file.commit) {
                var line = '   ' + file.commit.commitShort;
                line += ' | ' + xm.DateUtil.toNiceUTC(file.commit.gitAuthor.date);
                line += ' | ' + file.commit.gitAuthor.name;
                if(file.commit.hubAuthor) {
                    line += ' @' + file.commit.hubAuthor.login;
                }
                xm.log(line);
                xm.log('   ' + file.commit.message.subject);
                xm.log('----');
            } else if(!skipNull) {
                xm.log('   ' + '<no commmit>');
                xm.log('----');
            }
        }
        function printFileInfo(file, skipNull) {
            if (typeof skipNull === "undefined") { skipNull = false; }
            if(file.info) {
                if(file.info.isValid()) {
                    xm.log('   ' + file.info.toString());
                    xm.log('      ' + file.info.projectUrl);
                    file.info.authors.forEach(function (author) {
                        xm.log('      ' + author.toString());
                    });
                    xm.log('----');
                } else {
                    xm.log('   ' + '<invalid info>');
                    xm.log('----');
                }
            } else if(!skipNull) {
                xm.log('   ' + '<no info>');
                xm.log('----');
            }
        }
        expose.command('version', function (args) {
            xm.log(xm.PackageJSON.getLocal().version);
        }, 'Display version');
        expose.command('settings', function (args) {
            getContext(args).logInfo(true);
        }, 'Display config settings');
        expose.command('search', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.search(job.selector);
            }).done(function (result) {
                reportSucces(null);
                result.selection.forEach(function (file) {
                    printFileHead(file);
                    printFileInfo(file);
                    printFileCommit(file);
                });
            }, reportError);
        }, 'Search definitions', jobOptions(), [
            'selector'
        ]);
        expose.command('install', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.install(job.selector);
            }).done(function (result) {
                reportSucces(null);
                xm.log('');
                result.written.keys().sort().forEach(function (path) {
                    var file = result.written.get(path);
                    xm.log(file.toString());
                    xm.log('');
                });
            }, reportError);
        }, 'Install definitions', jobOptions(), [
            'selector'
        ]);
        expose.command('reinstall', function (args) {
            getAPIJob(args).then(function (job) {
                return job.api.reinstall();
            }).done(function (result) {
                reportSucces(null);
                xm.log('');
                result.written.keys().sort().forEach(function (path) {
                    var file = result.written.get(path);
                    xm.log(file.toString());
                    xm.log('');
                });
            }, reportError);
        }, 'Re-install definitions from config', jobOptions(), [
            'selector'
        ]);
        expose.command('info', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.info(job.selector);
            }).done(function (result) {
                reportSucces(null);
                result.selection.sort(tsd.DefUtil.fileCompare).forEach(function (file) {
                    printFileHead(file);
                    printFileInfo(file);
                    printFileCommit(file);
                });
            }, reportError);
        }, 'Show definition details', jobOptions(), [
            'selector'
        ]);
        expose.command('history', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.history(job.selector);
            }).done(function (result) {
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
            }, reportError);
        }, 'Show definition history', jobOptions(), [
            'selector'
        ]);
        expose.command('deps', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.deps(job.selector);
            }).done(function (result) {
                reportSucces(null);
                result.selection.sort(tsd.DefUtil.fileCompare).forEach(function (def) {
                    printFileHead(def);
                    printFileInfo(def);
                    if(def.dependencies.length > 0) {
                        def.dependencies.sort(tsd.DefUtil.fileCompare).forEach(function (def) {
                            xm.log(' - ' + def.toString());
                            if(def.dependencies.length > 0) {
                                def.dependencies.sort(tsd.DefUtil.fileCompare).forEach(function (def) {
                                    xm.log('    - ' + def.toString());
                                });
                            }
                        });
                        xm.log('----');
                    }
                });
            }, reportError);
        }, 'List dependencies', jobOptions(), [
            'selector'
        ]);
        expose.executeArgv(argvRaw, 'help');
    }
    tsd.runARGV = runARGV;
})(tsd || (tsd = {}));
(module).exports = {
    tsd: tsd,
    xm: xm,
    git: git,
    runARGV: tsd.runARGV,
    getAPI: function (configPath, verbose) {
        if (typeof verbose === "undefined") { verbose = false; }
        xm.assertVar('configPath', configPath, 'string');
        return new tsd.API(new tsd.Context(configPath, verbose));
    }
};
//@ sourceMappingURL=api.js.map
