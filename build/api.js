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
var xm;
(function (xm) {
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var FileUtil = (function () {
        function FileUtil() { }
        FileUtil.readJSONSync = function readJSONSync(src) {
            return JSON.parse(fs.readFileSync(src, 'utf8'));
        };
        FileUtil.readJSON = function readJSON(src, callback) {
            fs.readFile(path.resolve(src), 'utf8', function (err, file) {
                if(err || !file) {
                    return callback(err, null);
                }
                var json = null;
                try  {
                    json = JSON.parse(file);
                } catch (err) {
                    return callback(err, null);
                }
                return callback(null, json);
            });
        };
        FileUtil.writeJSONSync = function writeJSONSync(src, data, callback) {
            fs.writeFileSync(path.resolve(src), JSON.stringify(data, null, 2), 'utf8');
        };
        FileUtil.writeJSON = function writeJSON(src, data, callback) {
            fs.writeFile(path.resolve(src), JSON.stringify(data, null, 2), 'utf8', callback);
        };
        return FileUtil;
    })();
    xm.FileUtil = FileUtil;    
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
        for(var key in collection) {
            if(collection.hasOwnProperty(key)) {
                if(callback.call(thisArg, collection[key], key, collection) === false) {
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
        for(var key in collection) {
            if(collection.hasOwnProperty(key)) {
                memo = callback.call(thisArg, memo, collection[key], key, collection);
            }
        }
        return memo;
    }
    xm.reduceHash = reduceHash;
    function mapArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for(var i = 0, ii = collection.length; i < ii; i++) {
            map[i] = callback.call(thisArg, map[i], i, collection);
        }
        return map;
    }
    xm.mapArray = mapArray;
    function mapHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = {
        };
        for(var key in collection) {
            if(collection.hasOwnProperty(key)) {
                map[key] = callback.call(thisArg, collection[key], key, collection);
            }
        }
        return map;
    }
    xm.mapHash = mapHash;
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
        var logger = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            plain.apply(null, args);
        };
        logger.log = plain;
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
    var mkdirp = require('mkdirp');
    var path = require('path');
    var fs = require('fs');
    function mkdirCheck(dir, writable) {
        if (typeof writable === "undefined") { writable = false; }
        dir = path.resolve(dir);
        if(fs.existsSync(dir)) {
            if(!fs.statSync(dir).isDirectory()) {
                throw (new Error('path exists but is not a directory: ' + dir));
            }
            if(writable) {
                fs.chmodSync(dir, '0664');
            }
        } else {
            if(writable) {
                mkdirp.sync(dir, '0664');
            } else {
                mkdirp.sync(dir);
            }
        }
        if(writable) {
            var testFile = path.join(dir, 'mkdirCheck_' + Date.now() + '.tmp');
            fs.writeFileSync(testFile, 'test');
            fs.unlinkSync(testFile);
        }
        return dir;
    }
    xm.mkdirCheck = mkdirCheck;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var fs = require('fs');
    var path = require('path');
    var pkginfo = require('pkginfo');
    var PackageJSON = (function () {
        function PackageJSON(pkg, path) {
            if (typeof path === "undefined") { path = null; }
            this.pkg = pkg;
            this.path = path;
            if(!this.pkg) {
                throw new Error('no pkg');
            }
        }
        Object.defineProperty(PackageJSON.prototype, "name", {
            get: function () {
                return this.pkg.name || null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PackageJSON.prototype, "description", {
            get: function () {
                return this.pkg.description || '';
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PackageJSON.prototype, "version", {
            get: function () {
                return this.pkg.version || '0.0.0';
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
            return pkginfo.find((module));
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
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var assert = require('assert');
    var tv4 = require('tv4').tv4;
    var Config = (function () {
        function Config(schema) {
            this.schema = schema;
            this.typingsPath = 'typings';
            this.version = 'v4';
            this.repo = 'borisyankov/DefinitelyTyped';
            this.ref = 'master';
            xm.assertVar('schema', schema, 'object');
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
        Config.prototype.toJSON = function () {
            var json = {
                typingsPath: this.typingsPath,
                version: this.version,
                repo: this.repo,
                ref: this.ref,
                installed: {
                }
            };
            return json;
        };
        Config.getLocal = function getLocal(schema, file) {
            xm.assertVar('schema', schema, 'object');
            xm.assertVar('file', file, 'string');
            var cfg = new Config(schema);
            var json;
            if(fs.existsSync(file)) {
                var stats = fs.statSync(file);
                if(stats.isDirectory()) {
                    throw (new Error('config path exists but is a directory: ' + file));
                }
                json = xm.FileUtil.readJSONSync(file);
                var res = tv4.validateResult(json, schema);
                if(!res.valid || res.missing.length > 0) {
                    console.log(res.error.message);
                    if(res.error.dataPath) {
                        console.log(res.error.dataPath);
                    }
                    if(res.error.schemaPath) {
                        console.log(res.error.schemaPath);
                    }
                    throw (new Error('malformed config: doesn\'t comply with schema'));
                }
                cfg.typingsPath = json.typingsPath;
                cfg.version = json.version;
                cfg.repo = json.repo;
                cfg.ref = json.ref;
            }
            return cfg;
        };
        return Config;
    })();
    tsd.Config = Config;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var fs = require('fs');
    var os = require('os');
    var path = require('path');
    var Paths = (function () {
        function Paths(info) {
            this.info = info;
            xm.assertVar('info', info, xm.PackageJSON);
            this.setTmp(Paths.findTmpDir(info));
            this.setCache(path.join(this.tmp, 'cache'));
            this.typings = xm.mkdirCheck(path.resolve(process.cwd(), 'typings'), true);
            this.config = path.join(process.cwd(), 'tsd-config.json');
        }
        Paths.prototype.setTmp = function (dir) {
            dir = xm.mkdirCheck(dir, true);
            this.tmp = dir;
            return this.tmp;
        };
        Paths.prototype.setCache = function (dir) {
            dir = xm.mkdirCheck(dir, true);
            this.cache = dir;
            return dir;
        };
        Paths.findTmpDir = function findTmpDir(info) {
            xm.assertVar('info', info, xm.PackageJSON);
            var now = Date.now();
            var candidateTmpDirs = [
                process.env['TMPDIR'], 
                info.pkg.tmp, 
                os.tmpdir(), 
                path.resolve(process.cwd(), 'tmp')
            ];
            var key = info.getKey();
            for(var i = 0; i < candidateTmpDirs.length; i++) {
                if(!candidateTmpDirs[i]) {
                    continue;
                }
                var candidatePath = path.resolve(candidateTmpDirs[i], key);
                try  {
                    xm.mkdirCheck(candidatePath);
                    return candidatePath;
                } catch (e) {
                    console.log(candidatePath, 'is not writable:', e.message);
                }
            }
            throw (new Error('can not find a writable tmp directory.'));
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
    var mkdirp = require('mkdirp');
    var Q = require('Q');
    var tv4 = require('tv4').tv4;
    var Context = (function () {
        function Context(configPath, verbose) {
            if (typeof configPath === "undefined") { configPath = null; }
            if (typeof verbose === "undefined") { verbose = false; }
            this.verbose = verbose;
            this.log = xm.log;
            xm.assertVar('configPath', configPath, 'string', true);
            this.packageInfo = xm.PackageJSON.getLocal();
            this.paths = new tsd.Paths(this.packageInfo);
            var schema = xm.FileUtil.readJSONSync(path.resolve(path.dirname(this.packageInfo.path), 'schema', 'tsd-config_v4.json'));
            this.config = tsd.Config.getLocal(schema, configPath || this.paths.config);
            this.paths.typings = xm.mkdirCheck(this.config.typingsPath, true);
            Q.longStackSupport = true;
            if(this.verbose) {
                this.logInfo(true);
            }
        }
        Context.prototype.logInfo = function (details) {
            if (typeof details === "undefined") { details = false; }
            this.log(this.packageInfo.getNameVersion());
            this.log('repo: ' + this.config.repo + ' - #' + this.config.ref);
            if(details) {
                this.log.inspect(this.config, 'config');
                this.log.inspect(this.paths, 'paths');
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
        }
        StatCounter.prototype.count = function (id, amount) {
            if (typeof amount === "undefined") { amount = 1; }
            var value = this.stats.get(id, 0) + amount;
            this.stats.set(id, value);
            if(this.log) {
                xm.log('-> ' + id + ': ' + this.stats.get(id));
            }
            return value;
        };
        StatCounter.prototype.get = function (id) {
            return this.stats.get(id, 0);
        };
        StatCounter.prototype.zero = function () {
            var _this = this;
            this.stats.keys().forEach(function (id) {
                _this.stats.set(id, 0);
            });
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
    function assertVar(label, value, type, opt) {
        if (typeof opt === "undefined") { opt = false; }
        var valueType = typeof value;
        var typeKind = typeof type;
        if(!value && (valueType === 'undefined' || valueType === 'object')) {
            if(!opt) {
                throw (new Error('expected "' + label + '" to be defined but got "' + value + '"'));
            }
        } else if(typeKind === 'function') {
            if(value.constructor instanceof type) {
                throw (new Error('expected "' + label + '" to be instanceof "' + type + '" but got "' + value.constructor + '": ' + value));
            }
        } else if(typeKind === 'string') {
            if(valueType !== type) {
                throw (new Error('expected "' + label + '" expected typeof "' + type + '" but got "' + valueType + '": ' + value));
            }
        } else {
            throw (new Error('bad type assertion parameter "' + type + '" for "' + label + '"'));
        }
    }
    xm.assertVar = assertVar;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var _ = require('underscore');
    function md5(data) {
        var crypto = require('crypto');
        return crypto.createHash('md5').update(data).digest('hex');
    }
    xm.md5 = md5;
    function sha1(data) {
        var crypto = require('crypto');
        return crypto.createHash('sha1').update(data).digest('hex');
    }
    xm.sha1 = sha1;
    function jsonToIdent(obj) {
        var ret = '';
        var sep = ';';
        var type = typeof obj;
        if(type === 'string') {
            ret += JSON.stringify(obj) + sep;
        } else if(type === 'number') {
            ret += JSON.stringify(obj) + sep;
        } else if(type === 'boolean') {
            ret += String(obj) + sep;
        } else if(_.isDate(obj)) {
            ret += '<Date>' + obj.getTime() + sep;
        } else if(_.isArray(obj)) {
            ret += '[';
            _.forEach(obj, function (value) {
                ret += jsonToIdent(value);
            });
            ret += ']' + sep;
        } else if(type === 'function') {
            throw (new Error('jsonToIdent: cannot serialise Function'));
        } else if(_.isRegExp(obj)) {
            throw (new Error('jsonToIdent: cannot serialise RegExp'));
        } else if(_.isObject(obj)) {
            var keys = _.keys(obj);
            keys.sort();
            ret += '{';
            _.forEach(keys, function (key) {
                ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
            });
            ret += '}' + sep;
        } else {
            throw (new Error('jsonToIdent: cannot serialise value: ' + obj));
        }
        return ret;
    }
    xm.jsonToIdent = jsonToIdent;
})(xm || (xm = {}));
var git;
(function (git) {
    var GithubAPICachedResult = (function () {
        function GithubAPICachedResult(label, key, data) {
            xm.assertVar('label', label, 'string');
            xm.assertVar('key', key, 'string');
            xm.assertVar('data', data, 'object');
            this._label = label;
            this._key = key;
            this.setData(data);
        }
        GithubAPICachedResult.prototype.setData = function (data) {
            xm.assertVar('data', data, 'object');
            this._data = data;
            this._lastSet = new Date();
        };
        GithubAPICachedResult.prototype.toJSON = function () {
            return {
                key: this.key,
                hash: this.getHash(),
                data: this.data,
                label: this.label,
                lastSet: this.lastSet.getTime()
            };
        };
        GithubAPICachedResult.fromJSON = function fromJSON(json) {
            xm.assertVar('label', json.label, 'string');
            xm.assertVar('key', json.key, 'string');
            xm.assertVar('data', json.data, 'object');
            xm.assertVar('lastSet', json.lastSet, 'number');
            var call = new git.GithubAPICachedResult(json.label, json.key, json.data);
            call._lastSet = new Date(json.lastSet);
            return call;
        };
        GithubAPICachedResult.getHash = function getHash(key) {
            return xm.sha1(key);
        };
        GithubAPICachedResult.prototype.getHash = function () {
            return GithubAPICachedResult.getHash(this._key);
        };
        Object.defineProperty(GithubAPICachedResult.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GithubAPICachedResult.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GithubAPICachedResult.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GithubAPICachedResult.prototype, "lastSet", {
            get: function () {
                return this._lastSet;
            },
            enumerable: true,
            configurable: true
        });
        return GithubAPICachedResult;
    })();
    git.GithubAPICachedResult = GithubAPICachedResult;    
})(git || (git = {}));
var git;
(function (git) {
    var async = require('async');
    var _ = require('underscore');
    var Q = require('q');
    var assert = require('assert');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var path = require('path');
    var FS = require('q-io/fs');
    var GithubAPICachedJSONStore = (function () {
        function GithubAPICachedJSONStore(api, dir) {
            this.api = api;
            this._formatVersion = '0.0.2';
            xm.assertVar('api', api, git.GithubAPICached);
            xm.assertVar('dir', dir, 'string');
            this.dir = path.join(dir, api.getCacheKey() + '-fmt' + this._formatVersion);
        }
        GithubAPICachedJSONStore.prototype.init = function () {
            var self = this;
            return FS.exists(self.dir).then(function (exists) {
                if(!exists) {
                    return Q.nfcall(mkdirp, self.dir);
                } else {
                    return FS.isDirectory(self.dir).then(function (isDir) {
                        if(isDir) {
                            return null;
                        } else {
                            throw new Error('is not a directory: ' + self.dir);
                        }
                    });
                }
            });
        };
        GithubAPICachedJSONStore.prototype.getResult = function (key) {
            var self = this;
            var src = path.join(self.dir, git.GithubAPICachedResult.getHash(key) + '.json');
            return self.init().then(function () {
                return FS.exists(src);
            }).then(function (exists) {
                if(exists) {
                    return Q.nfcall(xm.FileUtil.readJSON, src).then(function (json) {
                        var cached;
                        try  {
                            cached = git.GithubAPICachedResult.fromJSON(json);
                        } catch (e) {
                            throw (new Error(src + ':' + e));
                        }
                        return cached;
                    });
                } else {
                    return null;
                }
            });
        };
        GithubAPICachedJSONStore.prototype.storeResult = function (res) {
            var self = this;
            var src = path.join(self.dir, res.getHash() + '.json');
            return self.init().then(function () {
                var data = JSON.stringify(res.toJSON(), null, 2);
                return FS.write(src, data);
            }).then(function () {
                return {
                    src: src
                };
            });
        };
        return GithubAPICachedJSONStore;
    })();
    git.GithubAPICachedJSONStore = GithubAPICachedJSONStore;    
})(git || (git = {}));
var xm;
(function (xm) {
    var _ = require('underscore');
    var template = require('url-template');
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
            this._templates.set(id, template.parse(url));
        };
        URLManager.prototype.addTemplates = function (map) {
            for(var id in map) {
                if(map.hasOwnProperty(id)) {
                    this.addTemplate(id, map[id]);
                }
            }
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
                return this.getTemplate(id).expand(_.defaults(vars, this._vars));
            }
            return this.getTemplate(id).expand(this._vars);
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
    var async = require('async');
    var _ = require('underscore');
    var Q = require('q');
    var assert = require('assert');
    var fs = require('fs');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var Github = require('github');
    var GithubAPICached = (function () {
        function GithubAPICached(repo, storeFolder) {
            this._apiVersion = '3.0.0';
            this._defaultOpts = {
            };
            this._debug = false;
            this.stats = new xm.StatCounter(false);
            xm.assertVar('repo', repo, git.GithubRepo);
            xm.assertVar('storeFolder', storeFolder, 'string');
            this._repo = repo;
            this._api = new Github({
                version: this._apiVersion
            });
            this._store = new git.GithubAPICachedJSONStore(this, storeFolder);
            this.rate = new GitRateLimitInfo();
        }
        GithubAPICached.prototype.getRepoParams = function (vars) {
            return _.defaults(vars, {
                user: this._repo.ownerName,
                repo: this._repo.projectName
            });
        };
        GithubAPICached.prototype.getCachedRaw = function (key) {
            return this._store.getResult(key);
        };
        GithubAPICached.prototype.getKey = function (label, keyTerms) {
            return xm.jsonToIdent([
                label, 
                keyTerms ? keyTerms : {
                }
            ]);
        };
        GithubAPICached.prototype.getBranches = function () {
            var _this = this;
            var params = this.getRepoParams({
            });
            return this.doCachedCall('getBranches', params, {
            }, function (cb) {
                _this._api.repos.getBranches(params, cb);
            });
        };
        GithubAPICached.prototype.getBranch = function (branch) {
            var _this = this;
            var params = this.getRepoParams({
                branch: branch
            });
            return this.doCachedCall('getBranch', params, {
            }, function (cb) {
                _this._api.repos.getBranch(params, cb);
            });
        };
        GithubAPICached.prototype.getTree = function (sha, recursive) {
            var _this = this;
            var params = this.getRepoParams({
                sha: sha,
                recursive: recursive
            });
            return this.doCachedCall('getTree', params, {
            }, function (cb) {
                _this._api.gitdata.getTree(params, cb);
            });
        };
        GithubAPICached.prototype.getCommit = function (sha) {
            var _this = this;
            var params = this.getRepoParams({
                sha: sha
            });
            return this.doCachedCall('getCommit', params, {
            }, function (cb) {
                _this._api.gitdata.getCommit(params, cb);
            });
        };
        GithubAPICached.prototype.getBlob = function (sha) {
            var _this = this;
            var params = this.getRepoParams({
                sha: sha,
                per_page: 100
            });
            return this.doCachedCall('getBlob', params, {
            }, function (cb) {
                _this._api.gitdata.getBlob(params, cb);
            });
        };
        GithubAPICached.prototype.getCommits = function (sha) {
            var _this = this;
            var params = this.getRepoParams({
                per_page: 100,
                sha: sha
            });
            return this.doCachedCall('getCommits', params, {
            }, function (cb) {
                _this._api.repos.getCommits(params, cb);
            });
        };
        GithubAPICached.prototype.getPathCommits = function (sha, path) {
            var _this = this;
            var params = this.getRepoParams({
                per_page: 100,
                sha: sha,
                path: path
            });
            return this.doCachedCall('getCommits', params, {
            }, function (cb) {
                _this._api.repos.getCommits(params, cb);
            });
        };
        GithubAPICached.prototype.doCachedCall = function (label, keyTerms, opts, call) {
            var key = this.getKey(label, keyTerms);
            var self = this;
            opts = _.defaults(opts || {
            }, self._defaultOpts);
            self.stats.count('invoked');
            var defer = Q.defer();
            var execCall = function () {
                self.stats.count('call-api');
                call.call(null, function (err, res) {
                    self.rate.readFromRes(res);
                    if(self._debug) {
                        xm.log(self.rate.toStatus());
                    }
                    if(err) {
                        self.stats.count('call-error');
                        defer.reject(err);
                        return;
                    }
                    self.stats.count('call-success');
                    var cached = new git.GithubAPICachedResult(label, key, res);
                    self._store.storeResult(cached).then(function (info) {
                        if(err) {
                            self.stats.count('store-set-error');
                            defer.reject(err);
                        } else {
                            self.stats.count('store-set');
                            defer.resolve(res);
                        }
                    });
                });
            };
            self._store.getResult(key).then(function (res) {
                if(res) {
                    self.stats.count('store-hit');
                    defer.resolve(res.data);
                } else {
                    self.stats.count('store-miss');
                    execCall();
                }
            }, function (err) {
                self.stats.count('store-get-error');
                defer.reject(err);
            });
            return defer.promise;
        };
        Object.defineProperty(GithubAPICached.prototype, "debug", {
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
        GithubAPICached.prototype.getCacheKey = function () {
            return this._repo.getCacheKey() + '-api' + this._apiVersion;
        };
        return GithubAPICached;
    })();
    git.GithubAPICached = GithubAPICached;    
    var GitRateLimitInfo = (function () {
        function GitRateLimitInfo() {
            this.limit = 0;
            this.remaining = 0;
            this.lastUpdate = new Date();
        }
        GitRateLimitInfo.prototype.readFromRes = function (response) {
            if(response && _.isObject(response.meta)) {
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
    var request = require('request');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var Q = require('q');
    var FS = require('q-io/fs');
    var GithubRawCached = (function () {
        function GithubRawCached(repo, storeFolder) {
            this._debug = false;
            this._formatVersion = '0.0.1';
            this.stats = new xm.StatCounter(false);
            xm.assertVar('repo', repo, git.GithubRepo);
            xm.assertVar('storeFolder', storeFolder, 'string');
            this._repo = repo;
            this._dir = path.join(storeFolder, this._repo.getCacheKey() + '-fmt' + this._formatVersion);
        }
        GithubRawCached.prototype.getFile = function (commitSha, filePath) {
            var _this = this;
            var self = this;
            self.stats.count('invoked');
            var tmp = filePath.split(/\/|\\\//g);
            tmp.unshift(commitSha);
            tmp.unshift(this._dir);
            var file = path.join.apply(null, tmp);
            if(this._debug) {
                xm.log(file);
            }
            return FS.exists(file).then(function (exists) {
                if(exists) {
                    return FS.isFile(file).then(function (isFile) {
                        if(!isFile) {
                            throw (new Error('path exists but is not a file: ' + file));
                        }
                        self.stats.count('store-hit');
                        return FS.read(file);
                    });
                } else {
                    self.stats.count('store-miss');
                    var opts = {
                        url: _this._repo.urls.rawFile(commitSha, filePath)
                    };
                    if(_this._debug) {
                        xm.log(opts.url);
                    }
                    return Q.nfcall(request.get, opts).spread(function (res) {
                        if(!res.statusCode || res.statusCode < 200 || res.statusCode >= 400) {
                            throw new Error('unexpected status code: ' + res.statusCode);
                        }
                        var content = String(res.body);
                        return Q.nfcall(mkdirp, path.dirname(file)).then(function () {
                            return FS.write(file, content);
                        }).then(function () {
                            self.stats.count('store-set');
                            return content;
                        });
                    });
                }
            });
        };
        Object.defineProperty(GithubRawCached.prototype, "debug", {
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
        return GithubRawCached;
    })();
    git.GithubRawCached = GithubRawCached;    
})(git || (git = {}));
var tsd;
(function (tsd) {
    var DefUtil = (function () {
        function DefUtil() { }
        DefUtil.getHeads = function getHeads(list) {
            return list.map(function (def) {
                return def.head;
            });
        };
        DefUtil.getDefs = function getDefs(list) {
            return list.map(function (def) {
                return def.def;
            });
        };
        DefUtil.uniqueDefPaths = function uniqueDefPaths(list) {
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
        return DefUtil;
    })();
    tsd.DefUtil = DefUtil;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Definition = (function () {
        function Definition(path) {
            this.path = path;
        }
        Definition.prototype.toString = function () {
            return this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
        };
        Definition.getFrom = function getFrom(path, blobSha, commitSha) {
            var defExp = /^(\w[\w_\.-]+?\w)\/(\w[\w_\.-]+?\w)\.d\.ts$/g;
            defExp.lastIndex = 0;
            var match = defExp.exec(path);
            if(!match) {
                return null;
            }
            if(match.length < 1) {
                return null;
            }
            if(match[1].length < 1 || match[2].length < 1) {
                return null;
            }
            var file = new tsd.Definition(path);
            file.project = match[1];
            file.name = match[2];
            file.head = new tsd.DefVersion(file, blobSha, commitSha);
            return file;
        };
        return Definition;
    })();
    tsd.Definition = Definition;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var DefVersion = (function () {
        function DefVersion(def, blobSha, commitSha) {
            this.def = def;
            this.blobSha = blobSha;
            this.commitSha = commitSha;
        }
        Object.defineProperty(DefVersion.prototype, "head", {
            get: function () {
                var def = this;
                while(def.newer) {
                    def = def.newer;
                }
                return def;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefVersion.prototype, "short", {
            get: function () {
                return (this.blobSha ? this.blobSha.substr(0, 8) : '<no sha>');
            },
            enumerable: true,
            configurable: true
        });
        DefVersion.prototype.toString = function () {
            var str = (this.def ? this.def.path : '<no file>');
            str += ' : ' + (this.blobSha ? this.blobSha.substr(0, 8) : '<no sha>');
            return str;
        };
        return DefVersion;
    })();
    tsd.DefVersion = DefVersion;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var pointer = require('jsonpointer.js');
    var commit_sha = '/commit/sha';
    var DefinitionIndex = (function () {
        function DefinitionIndex() {
            this._list = [];
        }
        DefinitionIndex.prototype.hasData = function () {
            return !!this._branchName && this._list.length > 0;
        };
        DefinitionIndex.prototype.setBranchTree = function (branch, tree) {
            var _this = this;
            xm.assertVar('branch', branch, 'object');
            xm.assertVar('tree', tree, 'object');
            this._branchName = branch.name;
            this._commitSha = pointer.get(branch, commit_sha);
            this._treeSha = tree.sha;
            this._list = [];
            var def;
            tree.tree.forEach(function (elem) {
                var char = elem.path.charAt(0);
                if(elem.type === 'blob' && char !== '.' && char !== '_') {
                    def = tsd.Definition.getFrom(elem.path, elem.sha, _this._commitSha);
                    if(def) {
                        _this.addFile(def);
                    }
                }
            }, this);
        };
        DefinitionIndex.prototype.addFile = function (def) {
            this._list.push(def);
        };
        DefinitionIndex.prototype.getPaths = function () {
            return this._list.map(function (file) {
                return file.path;
            }, this);
        };
        DefinitionIndex.prototype.toDump = function () {
            var ret = [];
            ret.push(this.toString());
            this._list.forEach(function (file) {
                ret.push('  ' + file.toString());
                var def = file.head;
                while(def) {
                    ret.push('    - ' + def.short);
                    def = def.older;
                }
            }, this);
            return ret.join('\n');
        };
        DefinitionIndex.prototype.toString = function () {
            return '[' + this._branchName + ']';
        };
        Object.defineProperty(DefinitionIndex.prototype, "branchName", {
            get: function () {
                return this._branchName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefinitionIndex.prototype, "commitSha", {
            get: function () {
                return this._commitSha;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefinitionIndex.prototype, "treeSha", {
            get: function () {
                return this._treeSha;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DefinitionIndex.prototype, "list", {
            get: function () {
                return this._list;
            },
            enumerable: true,
            configurable: true
        });
        return DefinitionIndex;
    })();
    tsd.DefinitionIndex = DefinitionIndex;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Q = require('q');
    var FS = require('q-io/fs');
    var assert = require('assert');
    var path = require('path');
    var mkdirp = require('mkdirp');
    var pointer = require('jsonpointer.js');
    var branch_tree = '/commit/commit/tree/sha';
    var APIOptions = (function () {
        function APIOptions() {
        }
        return APIOptions;
    })();
    tsd.APIOptions = APIOptions;    
    var APIResult = (function () {
        function APIResult(selector, options) {
            this.selector = selector;
            this.options = options;
            xm.assertVar('selector', selector, tsd.Selector);
        }
        return APIResult;
    })();
    tsd.APIResult = APIResult;    
    var APISelection = (function () {
        function APISelection() {
        }
        return APISelection;
    })();
    tsd.APISelection = APISelection;    
    var Core = (function () {
        function Core(context) {
            this.context = context;
            xm.assertVar('context', context, tsd.Context);
            this.index = new tsd.DefinitionIndex();
            this.gitRepo = new git.GithubRepo(context.config.repoOwner, context.config.repoProject);
            this.gitAPI = new git.GithubAPICached(this.gitRepo, path.join(context.paths.cache, 'git_api'));
            this.gitRaw = new git.GithubRawCached(this.gitRepo, path.join(context.paths.cache, 'git_raw'));
        }
        Core.prototype.getIndex = function () {
            var self = this;
            if(this.index.hasData()) {
                return Q(null);
            }
            var branchData;
            return self.gitAPI.getBranch(self.context.config.ref).then(function (data) {
                var sha = pointer.get(data, branch_tree);
                if(!sha) {
                    throw new Error('missing sha hash');
                }
                branchData = data;
                return self.gitAPI.getTree(sha, true);
            }).then(function (data) {
                self.index.setBranchTree(branchData, data);
                return null;
            });
        };
        Core.prototype.select = function (selector, options) {
            var self = this;
            var result = new APIResult(selector, options);
            return self.getIndex().then(function () {
                result.nameMatches = selector.pattern.matchTo(self.index.list);
                result.selection = tsd.DefUtil.getHeads(result.nameMatches);
                return result;
            });
        };
        Core.prototype.writeSingleFile = function (file) {
            var self = this;
            var target = path.resolve(self.context.paths.typings, file.def.path);
            var dir = path.dirname(target);
            return Q.nfcall(mkdirp, dir).then(function () {
                if(file.content) {
                    return file.content;
                }
                return self.gitRaw.getFile(file.commitSha, file.def.path);
            }).then(function (content) {
                file.content = content;
                return FS.exists(target);
            }).then(function (exists) {
                if(exists) {
                    return FS.remove(target);
                }
                return null;
            }).then(function () {
                return FS.write(target, file.content);
            }).then(function () {
                return target;
            });
        };
        Core.prototype.writeFiles = function (list) {
            var self = this;
            list = tsd.DefUtil.uniqueDefPaths(list);
            return Q.all(list.map(function (file) {
                return self.writeSingleFile(file);
            }));
        };
        Core.prototype.saveToConfig = function (list) {
            var self = this;
            list = tsd.DefUtil.uniqueDefPaths(list);
            return Q.reject(new Error('not yet implemented'));
        };
        return Core;
    })();
    tsd.Core = Core;    
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
    var SelectorFilePattern = (function () {
        function SelectorFilePattern(pattern) {
            xm.assertVar('pattern', pattern, 'string');
            this.pattern = pattern;
        }
        SelectorFilePattern.prototype.matchTo = function (list) {
            return list.filter(this.getFilterFunc(), this);
        };
        SelectorFilePattern.prototype.compile = function () {
            if(!this.pattern) {
                throw (new Error('SelectorFilePattern undefined pattern'));
            }
            this.projectExp = null;
            this.nameExp = null;
            if(this.pattern.indexOf('/') > -1) {
                this.compileSplit();
            } else {
                this.compileSingle();
            }
        };
        SelectorFilePattern.prototype.compileSingle = function () {
            patternSingle.lastIndex = 0;
            var match = patternSingle.exec(this.pattern);
            if(match.length < 4) {
                throw (new Error('SelectorFilePattern bad match: "' + match + '"'));
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
        SelectorFilePattern.prototype.compileSplit = function () {
            patternSplit.lastIndex = 0;
            var match = patternSplit.exec(this.pattern);
            if(match.length < 7) {
                throw (new Error('SelectorFilePattern bad match: "' + match + '"'));
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
        SelectorFilePattern.prototype.getFilterFunc = function () {
            this.compile();
            var self = this;
            if(this.nameExp) {
                if(this.projectExp) {
                    return function (file) {
                        return self.projectExp.test(file.project) && self.nameExp.test(file.name);
                    };
                } else {
                    return function (file) {
                        return self.nameExp.test(file.name);
                    };
                }
            } else if(this.projectExp) {
                return function (file) {
                    return self.projectExp.test(file.name);
                };
            } else {
                throw (new Error('SelectorFilePattern cannot compile pattern: ' + JSON.stringify(this.pattern) + ''));
            }
        };
        return SelectorFilePattern;
    })();
    tsd.SelectorFilePattern = SelectorFilePattern;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var Selector = (function () {
        function Selector(pattern) {
            if (typeof pattern === "undefined") { pattern = '*'; }
            xm.assertVar('pattern', pattern, tsd.SelectorFilePattern);
            this.pattern = new tsd.SelectorFilePattern(pattern);
        }
        Object.defineProperty(Selector.prototype, "requiresSource", {
            get: function () {
                return !!(this.resolveReferences);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Selector.prototype, "requiresHistory", {
            get: function () {
                return !!(this.beforeDate || this.afterDate);
            },
            enumerable: true,
            configurable: true
        });
        return Selector;
    })();
    tsd.Selector = Selector;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var path = require('path');
    var util = require('util');
    var Q = require('Q');
    var FS = require('Q-io/fs');
    var API = (function () {
        function API(context) {
            this.context = context;
            if(!context) {
                throw new Error('no context');
            }
            this._core = new tsd.Core(this.context);
        }
        API.prototype.search = function (selector, options) {
            return this._core.select(selector, options);
        };
        API.prototype.install = function (selector, options) {
            var _this = this;
            return this._core.select(selector, options).then(function (res) {
                return _this._core.writeFiles(res.selection);
            });
        };
        API.prototype.purge = function () {
            return Q.reject(new Error('not yet implemented'));
        };
        API.prototype.details = function (selector, options) {
            return this._core.select(selector, options).then(function (res) {
            });
        };
        API.prototype.deps = function (selector, options) {
            return Q.reject(new Error('not yet implemented'));
        };
        API.prototype.compare = function (selector, options) {
            return Q.reject(new Error('not yet implemented'));
        };
        API.prototype.update = function (selector, options) {
            return Q.reject(new Error('not yet implemented'));
        };
        return API;
    })();
    tsd.API = API;    
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    function padLeft(str, len, char) {
        str = String(str);
        char = String(char).charAt(0);
        while(str.length < len) {
            str = char + str;
        }
        return str;
    }
    function padRight(str, len, char) {
        str = String(str);
        char = String(char).charAt(0);
        while(str.length < len) {
            str = str + char;
        }
        return str;
    }
    function repeat(str, len) {
        return new Array(len).join(str);
    }
    var optimist = require('optimist');
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
            this._commandOpts = [];
            this._isInit = false;
            this.command('help', function () {
                _this.printCommands();
            }, 'usage help');
            this.defineOption({
                name: 'help',
                short: 'h',
                description: 'display usage help',
                type: 'flag',
                default: null,
                placeholder: null,
                command: 'help'
            });
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
                optimist.alias(option.name, option.short);
                if(option.type === 'flag') {
                    optimist.boolean(option.name);
                } else if(option.type === 'string') {
                    optimist.string(option.name);
                }
                optimist.default(option.name, option.default);
                if(option.command) {
                    _this._commandOpts.push(option.name);
                }
            });
            xm.eachProp(this._commands.keys(), function (id) {
                _this._commands.get(id).init();
            });
        };
        Expose.prototype.executeArgv = function (argvRaw, alt) {
            this.init();
            var argv = optimist.parse(argvRaw);
            if(!argv || argv._.length === 0) {
                if(alt && this._commands.has(alt)) {
                    this.execute(alt, argv);
                } else {
                    this.execute('help', argv);
                }
                return;
            }
            for(var i = 0, ii = this._commandOpts.length; i < ii; i++) {
                var name = this._commandOpts[i];
                if(argv[name]) {
                    console.log('command opt ' + name);
                    this.execute(this._options.get(name).command, argv);
                    return;
                }
            }
            var use = argv._.shift();
            if(use === 'node') {
                argv._.shift();
            }
            use = argv._.shift();
            if(typeof use === 'undefined') {
                if(alt && this._commands.has(alt)) {
                    console.log('undefined command, use default');
                    this.execute(alt, argv);
                } else {
                    console.log('undefined command');
                    this.execute('help', argv);
                }
            } else if(this._commands.has(use)) {
                this.execute(use, argv);
            } else {
                console.log('command not found: ' + use);
                this.execute('help', argv, false);
            }
        };
        Expose.prototype.execute = function (id, args, head) {
            if (typeof args === "undefined") { args = null; }
            if (typeof head === "undefined") { head = true; }
            this.init();
            if(!this._commands.has(id)) {
                console.log('\nunknown command ' + id + '\n');
                return;
            }
            if(head) {
                console.log('\n-> ' + id + '\n');
            }
            var f = this._commands.get(id);
            f.execute.call(f, args);
        };
        Expose.prototype.printCommands = function () {
            var _this = this;
            if(this.title) {
                console.log(this.title + '\n');
            }
            if(this._commandOpts.length > 0) {
                console.log('global options:\n');
                var opts = [];
                var maxTopOptionLen = 0;
                xm.eachProp(this._commandOpts.sort(), function (name) {
                    var option = _this._options.get(name);
                    var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
                    var tmp = (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
                    opts.push({
                        name: name,
                        usage: tmp,
                        option: option
                    });
                    maxTopOptionLen = Math.max(tmp.length, maxTopOptionLen);
                });
                xm.eachProp(opts, function (opt) {
                    console.log('  ' + padRight(opt.usage, maxTopOptionLen, ' ') + ' : ' + opt.option.description);
                });
                console.log('');
            }
            console.log('commands:\n');
            var maxCommandLen = 0;
            var maxOptionLen = 0;
            var commands = [];
            xm.eachProp(this._commands.keys().sort(), function (id) {
                var data = {
                    id: id,
                    label: id,
                    cmd: _this._commands.get(id),
                    options: []
                };
                if(data.cmd.variadic.length > 0) {
                    data.label += ' <' + data.cmd.variadic.join(', ') + '>';
                }
                maxCommandLen = Math.max(data.label.length, maxCommandLen);
                xm.eachProp(data.cmd.options, function (name) {
                    var option = _this._options.get(name);
                    var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
                    var tmp = (option.short ? '-' + option.short + ', ' : '') + '--' + option.name + placeholder;
                    maxOptionLen = Math.max(tmp.length, maxOptionLen);
                    data.options.push({
                        usage: tmp,
                        option: option
                    });
                });
                commands.push(data);
            });
            var padOpts = '    ';
            xm.eachProp(commands, function (data) {
                console.log('  ' + padRight(data.label, maxCommandLen, ' ') + ' : ' + data.cmd.label);
                xm.eachProp(data.options, function (opt) {
                    console.log(padOpts + padRight(opt.usage, maxOptionLen, ' ') + ' : ' + opt.option.description);
                });
            });
        };
        Expose.prototype.hasCommand = function (id) {
            return this._commands.has(id);
        };
        Expose.prototype.getCommand = function (id) {
            return this._commands.get(id);
        };
        return Expose;
    })();
    xm.Expose = Expose;    
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    var path = require('path');
    var Q = require('q');
    function getContext(args) {
        xm.assertVar('args', args, 'object');
        return new tsd.Context(args.config, args.verbose);
    }
    var defaultJobOptions = [
        'config', 
        'verbose'
    ];
    function jobOptions(merge) {
        if (typeof merge === "undefined") { merge = []; }
        return defaultJobOptions.concat(merge);
    }
    var Job = (function () {
        function Job() { }
        return Job;
    })();    
    function getSelectorJob(args) {
        return Q.fcall(function () {
            var job = new Job();
            if(args._.length === 0) {
                throw new Error('pass a name selector pattern');
            }
            job.context = getContext(args);
            job.api = new tsd.API(job.context);
            job.selector = new tsd.Selector(args._[0]);
            job.options = new tsd.APIOptions();
            return job;
        });
    }
    function runARGV(argvRaw, configPath) {
        var expose = new xm.Expose(xm.PackageJSON.getLocal().getNameVersion());
        expose.defineOption({
            name: 'version',
            short: 'V',
            description: 'display version information',
            type: 'flag',
            default: null,
            placeholder: null,
            command: 'version'
        });
        expose.defineOption({
            name: 'config',
            description: 'path to config file',
            short: 'c',
            type: 'string',
            default: null,
            placeholder: 'path',
            command: null
        });
        expose.defineOption({
            name: 'verbose',
            short: null,
            description: 'verbose output',
            type: 'flag',
            default: null,
            placeholder: null,
            command: null
        });
        function reportError(err) {
            xm.log('->' + 'an error occured!'.red);
            xm.log(err);
        }
        function reportSucces(result) {
            xm.log('->' + 'success!'.green);
            if(result) {
                xm.log.inspect(result, null, 2);
            }
        }
        expose.command('version', function (args) {
            xm.log(xm.PackageJSON.getLocal().version);
        }, 'display version');
        expose.command('info', function (args) {
            getContext(args).logInfo(true);
        }, 'display config settings');
        expose.command('search', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.search(job.selector, job.options);
            }).done(reportSucces, reportError);
        }, 'search definitions', jobOptions(), [
            'selector'
        ]);
        expose.command('install', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.install(job.selector, job.options);
            }).done(reportSucces, reportError);
        }, 'install definitions', jobOptions(), [
            'selector'
        ]);
        expose.command('details', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.details(job.selector, job.options);
            }).done(function (result) {
                reportSucces(result);
            }, reportError);
        }, 'show definition details', jobOptions(), [
            'selector'
        ]);
        expose.command('deps', function (args) {
            getSelectorJob(args).then(function (job) {
                return job.api.deps(job.selector, job.options);
            }).done(function (result) {
                reportSucces(result);
            }, reportError);
        }, 'list dependencies', jobOptions(), [
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
