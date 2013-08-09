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
    ;
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
        for(var i = 0, ii = collection.length; i < ii; i++) {
            if(callback.call(thisArg, collection[i], i, collection) === false) {
                return;
            }
        }
    }
    xm.eachElem = eachElem;
    function eachProp(collection, callback, thisArg) {
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
        for(var i = 0, ii = collection.length; i < ii; i++) {
            memo = callback.call(thisArg, memo, collection[i], i, collection);
        }
        return memo;
    }
    xm.reduceArray = reduceArray;
    function reduceHash(collection, memo, callback, thisArg) {
        for(var key in collection) {
            if(collection.hasOwnProperty(key)) {
                memo = callback.call(thisArg, memo, collection[key], key, collection);
            }
        }
        return memo;
    }
    xm.reduceHash = reduceHash;
    function mapArray(collection, callback, thisArg) {
        var map = [];
        for(var i = 0, ii = collection.length; i < ii; i++) {
            map[i] = callback.call(thisArg, map[i], i, collection);
        }
        return map;
    }
    xm.mapArray = mapArray;
    function mapHash(collection, callback, thisArg) {
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
    function getLogger(writer) {
        writer = writer || new xm.ConsoleLineWriter();
        var writeMulti = function (prefix, postfix, args) {
            for(var i = 0, ii = args.length; i < ii; i++) {
                writer.writeln(prefix + args[i] + postfix);
            }
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
            if (typeof depth === "undefined") { depth = 6; }
            label = label ? label + ':\n' : '';
            writer.writeln(label + util.inspect(value, {
                showHidden: false,
                depth: depth
            }));
        };
        return logger;
    }
    xm.getLogger = getLogger;
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    var fs = require('fs');
    var path = require('path');
    var PackageJSON = (function () {
        function PackageJSON(pkg) {
            this.pkg = pkg;
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
        Object.defineProperty(PackageJSON.prototype, "version", {
            get: function () {
                return this.pkg.version || '0';
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
        PackageJSON.getLocal = function getLocal() {
            var json = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'package.json'));
            return new PackageJSON(json);
        };
        return PackageJSON;
    })();
    tsd.PackageJSON = PackageJSON;    
})(tsd || (tsd = {}));
var tsd;
(function (tsd) {
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var assert = require('assert');
    var tv4 = require('tv4').tv4;
    var Installed = (function () {
        function Installed(selector, commit, hash) {
            if (typeof selector === "undefined") { selector = null; }
            if (typeof commit === "undefined") { commit = null; }
            if (typeof hash === "undefined") { hash = null; }
            this.selector = selector;
            this.commit = commit;
            this.hash = hash;
        }
        Installed.prototype.toString = function () {
            return this.selector;
        };
        return Installed;
    })();
    tsd.Installed = Installed;    
    var Config = (function () {
        function Config() {
            this.typingsPath = 'typings';
            this.version = 'v4';
            this.repo = 'borisyankov/DefinitelyTyped';
            this.ref = 'master';
            this.installed = {
            };
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
        Object.defineProperty(Config.prototype, "repoURL", {
            get: function () {
                return 'http://github.com/' + this.repo;
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
        Config.getLocal = function getLocal(file) {
            var cfg = new Config();
            var json;
            if(fs.existsSync(file)) {
                json = xm.FileUtil.readJSONSync(file);
                var schema = xm.FileUtil.readJSONSync(path.join(process.cwd(), 'schema', 'tsd-config_v4.json'));
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
    var path = require('path');
    var assert = require('assert');
    var mkdirp = require('mkdirp');
    var Paths = (function () {
        function Paths(info) {
            assert.ok(info, 'info');
            this.tmp = Paths.findTmpDir(info);
            this.cache = path.join(this.tmp, 'tsd');
            mkdirp.sync(this.cache);
            this.typings = path.join(process.cwd(), 'typings');
            this.config = path.join(process.cwd(), 'tsd-config.json');
        }
        Paths.prototype.setTypings = function (dir) {
            if(fs.existsSync(dir)) {
                if(!fs.statSync(dir).isDirectory()) {
                    throw (new Error('path exists but is not a directory: ' + dir));
                }
            } else {
                this.typings = dir;
                mkdirp.sync(dir);
            }
        };
        Paths.findTmpDir = function findTmpDir(info) {
            var now = Date.now();
            var candidateTmpDirs = [
                process.env['TMPDIR'] || '/tmp', 
                info.pkg.tmp, 
                path.join(process.cwd(), 'tmp')
            ];
            for(var i = 0; i < candidateTmpDirs.length; i++) {
                var candidatePath = path.join(candidateTmpDirs[i], info.getKey());
                try  {
                    mkdirp.sync(candidatePath, '0777');
                    var testFile = path.join(candidatePath, now + '.tmp');
                    fs.writeFileSync(testFile, 'test');
                    fs.unlinkSync(testFile);
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
    var tv4 = require('tv4').tv4;
    var Context = (function () {
        function Context(configPath, verbose) {
            if (typeof configPath === "undefined") { configPath = null; }
            if (typeof verbose === "undefined") { verbose = false; }
            this.verbose = verbose;
            this.log = xm.getLogger();
            this.packageInfo = tsd.PackageJSON.getLocal();
            this.paths = new tsd.Paths(this.packageInfo);
            this.config = tsd.Config.getLocal(configPath || this.paths.config);
            this.paths.setTypings(this.config.typingsPath);
            if(this.verbose) {
                this.logInfo(this.verbose);
            }
        }
        Context.prototype.logInfo = function (details) {
            if (typeof details === "undefined") { details = false; }
            this.log(this.packageInfo.getNameVersion());
            this.log('repo: ' + this.config.repoURL + ' - #' + this.config.ref);
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
            this._prefix = '#_';
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
            this.log = log;
            this.stats = new xm.KeyValueMap();
        }
        StatCounter.prototype.count = function (id, amount) {
            if (typeof amount === "undefined") { amount = 1; }
            this.stats.set(id, this.stats.get(id, 0) + amount);
            if(this.log) {
                console.log('-> ' + id + ': ' + this.stats.get(id));
            }
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
                return value != 0;
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
        if(_.isString(obj)) {
            ret += JSON.stringify(obj) + sep;
        } else if(_.isNumber(obj)) {
            ret += JSON.stringify(obj) + sep;
        } else if(_.isDate(obj)) {
            ret += '<Date>' + obj.getTime() + sep;
        } else if(_.isArray(obj)) {
            ret += '[';
            _.forEach(obj, function (value) {
                ret += jsonToIdent(value);
            });
            ret += ']' + sep;
        } else if(_.isFunction(obj)) {
            throw (new Error('cannot serialise Function'));
        } else if(_.isRegExp(obj)) {
            throw (new Error('cannot serialise RegExp'));
        } else if(_.isObject(obj)) {
            var keys = _.keys(obj);
            keys.sort();
            ret += '{';
            _.forEach(keys, function (key) {
                ret += JSON.stringify(key) + ':' + jsonToIdent(obj[key]);
            });
            ret += '}' + sep;
        } else {
            throw (new Error('cannot serialise value: ' + obj));
        }
        return ret;
    }
    xm.jsonToIdent = jsonToIdent;
})(xm || (xm = {}));
var git;
(function (git) {
    var async = require('async');
    var _ = require('underscore');
    var assert = require('assert');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var path = require('path');
    var GitAPICachedResult = (function () {
        function GitAPICachedResult(label, key, data) {
            assert.ok(label, 'label');
            assert.ok(key, 'key');
            assert.ok(data, 'data');
            this._label = label;
            this._key = key;
            this.setData(data);
        }
        GitAPICachedResult.prototype.setData = function (data) {
            this._data = data;
            this._lastSet = new Date();
        };
        GitAPICachedResult.prototype.toJSON = function () {
            return {
                key: this.key,
                data: this.data,
                label: this.label,
                lastSet: this.lastSet.getTime()
            };
        };
        GitAPICachedResult.fromJSON = function fromJSON(json) {
            assert.ok(json.label, 'json.label');
            assert.ok(json.key, 'json.key');
            assert.ok(json.data, 'json.data');
            assert.ok(json.lastSet, 'json.lastSet');
            var call = new GitAPICachedResult(json.label, json.key, json.data);
            call._lastSet = new Date(json.lastSet);
            return call;
        };
        GitAPICachedResult.getHash = function getHash(key) {
            return xm.sha1(key);
        };
        Object.defineProperty(GitAPICachedResult.prototype, "label", {
            get: function () {
                return this._label;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GitAPICachedResult.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GitAPICachedResult.prototype, "data", {
            get: function () {
                return this._data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(GitAPICachedResult.prototype, "lastSet", {
            get: function () {
                return this._lastSet;
            },
            enumerable: true,
            configurable: true
        });
        return GitAPICachedResult;
    })();
    git.GitAPICachedResult = GitAPICachedResult;    
})(git || (git = {}));
var git;
(function (git) {
    var async = require('async');
    var _ = require('underscore');
    var assert = require('assert');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var path = require('path');
    var GitAPICachedJSONStore = (function () {
        function GitAPICachedJSONStore(api, dir) {
            this.api = api;
            this.dir = path.join(dir, api.getCacheKey());
        }
        GitAPICachedJSONStore.prototype.init = function (callback) {
            var self = this;
            fs.exists(self.dir, function (exists) {
                if(!exists) {
                    mkdirp(self.dir, function (err) {
                        if(err) {
                            return callback('cannot create dir: ' + self.dir + ': ' + err);
                        }
                        return callback(null);
                    });
                } else {
                    fs.stat(self.dir, function (err, stats) {
                        if(!stats.isDirectory()) {
                            return callback('is not a directory: ' + self.dir);
                        }
                        return callback(null);
                    });
                }
            });
        };
        GitAPICachedJSONStore.prototype.getResult = function (key, callback) {
            var self = this;
            self.init(function (err) {
                if(err) {
                    return callback(err, null);
                }
                var src = path.join(self.dir, git.GitAPICachedResult.getHash(key) + '.json');
                fs.exists(src, function (exists) {
                    if(!exists) {
                        return callback(null, null);
                    }
                    xm.FileUtil.readJSON(src, function (err, json) {
                        if(err) {
                            return callback(err, null);
                        }
                        var cached;
                        try  {
                            cached = git.GitAPICachedResult.fromJSON(json);
                        } catch (e) {
                            return callback(src + ':' + e, null);
                        }
                        callback(null, cached);
                    });
                });
            });
        };
        GitAPICachedJSONStore.prototype.storeResult = function (res, callback) {
            var self = this;
            self.init(function (err) {
                if(err) {
                    return callback(err, null);
                }
                var src = path.join(self.dir, git.GitAPICachedResult.getHash(res.key) + '.json');
                var data = JSON.stringify(res.toJSON(), null, 2);
                fs.writeFile(src, data, function (err) {
                    callback(err, {
                        src: src
                    });
                });
            });
        };
        return GitAPICachedJSONStore;
    })();
    git.GitAPICachedJSONStore = GitAPICachedJSONStore;    
})(git || (git = {}));
var git;
(function (git) {
    var async = require('async');
    var _ = require('underscore');
    var assert = require('assert');
    var mkdirp = require('mkdirp');
    var fs = require('fs');
    var path = require('path');
    var GitAPICached = (function () {
        function GitAPICached(repoOwner, projectName, storeFolder) {
            this._cache = new xm.KeyValueMap();
            this._version = "3.0.0";
            this._defaultOpts = {
                readCache: true,
                writeCache: true,
                readStore: true,
                writeStore: true
            };
            this.stats = new xm.StatCounter(false);
            assert.ok(repoOwner, 'expected repoOwner argument');
            assert.ok(projectName, 'expected projectName argument');
            assert.ok(storeFolder, 'expected storeFolder argument');
            this._repoOwner = repoOwner;
            this._projectName = projectName;
            this._store = new git.GitAPICachedJSONStore(this, path.join(storeFolder, 'git_api_cache'));
            var GitHubApi = require("github");
            this._api = new GitHubApi({
                version: this._version
            });
            this.rate = new GitRateLimitInfo();
        }
        GitAPICached.prototype.getRepoParams = function (vars) {
            return _.defaults(vars, {
                user: this._repoOwner,
                repo: this._projectName
            });
        };
        GitAPICached.prototype.getCachedRaw = function (key, callback) {
            var self = this;
            if(self._cache.has(key)) {
                xm.callAsync(callback, null, self._cache.get(key));
                return;
            }
            self._store.getResult(key, function (err, res) {
                return callback(err, res);
            });
        };
        GitAPICached.prototype.getKey = function (label, keyTerms) {
            return xm.jsonToIdent([
                label, 
                keyTerms ? keyTerms : {
                }
            ]);
        };
        GitAPICached.prototype.getBranch = function (branch, callback) {
            var _this = this;
            var params = this.getRepoParams({
                branch: branch
            });
            return this.doCachedCall('getBranch', params, {
            }, function (cb) {
                _this._api.repos.getBranch(params, cb);
            }, callback);
        };
        GitAPICached.prototype.getBranches = function (callback) {
            var _this = this;
            var params = this.getRepoParams({
            });
            return this.doCachedCall('getBranches', params, {
            }, function (cb) {
                _this._api.repos.getBranches(params, cb);
            }, callback);
        };
        GitAPICached.prototype.getCommit = function (sha, finish) {
            var _this = this;
            var params = this.getRepoParams({
                sha: sha
            });
            return this.doCachedCall('getCommit', params, {
            }, function (cb) {
                _this._api.repos.getCommit(params, cb);
            }, finish);
        };
        GitAPICached.prototype.doCachedCall = function (label, keyTerms, opts, call, callback) {
            var _this = this;
            var key = this.getKey(label, keyTerms);
            var self = this;
            opts = _.defaults(opts || {
            }, self._defaultOpts);
            self.stats.count('called');
            if(opts.readCache) {
                if(this._cache.has(key)) {
                    self.stats.count('cache-hit');
                    xm.callAsync(callback, null, this._cache.get(key).data);
                    return key;
                }
                self.stats.count('cache-miss');
            } else {
                self.stats.count('cache-get-skip');
            }
            var execCall = function () {
                self.stats.count('call-api');
                call.call(_this, function (err, res) {
                    self.rate.getFromRes(res);
                    if(err) {
                        self.stats.count('call-error');
                        return callback(err, null);
                    }
                    self.stats.count('call-success');
                    var cached = new git.GitAPICachedResult(label, key, res);
                    if(opts.writeCache) {
                        self._cache.set(key, cached);
                        self.stats.count('cache-set');
                    } else {
                        self.stats.count('cache-set-skip');
                    }
                    if(opts.writeStore) {
                        self._store.storeResult(cached, function (err, info) {
                            if(err) {
                                console.log(err);
                                self.stats.count('store-set-error');
                                return callback(err, null);
                            }
                            self.stats.count('store-set');
                            callback(err, res);
                        });
                    } else {
                        self.stats.count('store-set-skip');
                        callback(err, res);
                    }
                });
            };
            if(opts.readStore) {
                self._store.getResult(key, function (err, res) {
                    if(err) {
                        self.stats.count('store-get-error');
                        return callback(err, null);
                    }
                    if(res) {
                        self.stats.count('store-hit');
                        return callback(null, res);
                    }
                    self.stats.count('store-miss');
                    execCall();
                });
            } else {
                self.stats.count('store-get-skip');
                execCall();
            }
            return key;
        };
        GitAPICached.prototype.getCacheKey = function () {
            return this._repoOwner + '-' + this._projectName + '-v' + this._version;
        };
        return GitAPICached;
    })();
    git.GitAPICached = GitAPICached;    
    var GitRateLimitInfo = (function () {
        function GitRateLimitInfo() {
            this.limit = 0;
            this.remaining = 0;
            this.lastUpdate = new Date();
        }
        GitRateLimitInfo.prototype.getFromRes = function (response) {
            if(response && _.isObject(response.meta)) {
                if(response.meta.hasOwnProperty('x-ratelimit-limit')) {
                    this.limit = parseInt(response.meta['x-ratelimit-limit']);
                }
                if(response.meta.hasOwnProperty('x-ratelimit-remaining')) {
                    this.remaining = parseInt(response.meta['x-ratelimit-remaining']);
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
    var GitURLs = (function (_super) {
        __extends(GitURLs, _super);
        function GitURLs(repoOwner, projectName) {
                _super.call(this);
            this._api = 'https://api.github.com/repos/{owner}/{project}';
            this._base = 'https://github.com/{owner}/{project}';
            assert.ok(repoOwner, 'expected repoOwner argument');
            assert.ok(projectName, 'expected projectName argument');
            this.setVars({
                owner: repoOwner,
                project: projectName
            });
            this.addTemplate('api', this._api);
            this.addTemplate('base', this._base);
            this.addTemplate('raw', this._base + '/raw');
            this.addTemplate('rawFile', this._base + '/raw/{+path}');
        }
        GitURLs.prototype.api = function () {
            return this.getURL('api');
        };
        GitURLs.prototype.base = function () {
            return this.getURL('base');
        };
        GitURLs.prototype.raw = function (sha) {
            return this.getURL('raw');
        };
        GitURLs.prototype.rawFile = function (path) {
            return this.getURL('rawFile', {
                path: path
            });
        };
        return GitURLs;
    })(xm.URLManager);
    git.GitURLs = GitURLs;    
})(git || (git = {}));
var tsd;
(function (tsd) {
    var async = require('async');
    var Core = (function () {
        function Core(context) {
            this.context = context;
            this.gitURL = new git.GitURLs(context.config.repoOwner, context.config.repoProject);
            this.gitAPI = new git.GitAPICached(context.config.repoOwner, context.config.repoProject, context.paths.cache);
        }
        Core.prototype.init = function (callback) {
        };
        return Core;
    })();
    tsd.Core = Core;    
})(tsd || (tsd = {}));
var xm;
(function (xm) {
    var fs = require('fs');
    var path = require('path');
    var util = require('util');
    var async = require('async');
    var APIOptions = (function () {
        function APIOptions() {
        }
        return APIOptions;
    })();
    xm.APIOptions = APIOptions;    
    var APIResult = (function () {
        function APIResult() {
        }
        return APIResult;
    })();
    xm.APIResult = APIResult;    
    var API = (function () {
        function API(context) {
            this.context = context;
            if(!this.context) {
                throw new Error('no context');
            }
        }
        API.prototype.search = function (selector, options, callback) {
        };
        API.prototype.deps = function (selector, options, callback) {
        };
        API.prototype.install = function (selector, options, callback) {
        };
        API.prototype.details = function (selector, options, callback) {
        };
        API.prototype.compare = function (selector, options, callback) {
        };
        API.prototype.update = function (selector, options, callback) {
        };
        API.prototype.init = function (selector, options, callback) {
        };
        return API;
    })();
    xm.API = API;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    var Selector = (function () {
        function Selector() {
        }
        return Selector;
    })();
    xm.Selector = Selector;    
})(xm || (xm = {}));
var xm;
(function (xm) {
    var ExposeCommand = (function () {
        function ExposeCommand(id, execute, label, hint) {
            this.id = id;
            this.execute = execute;
            this.label = label;
            this.hint = hint;
        }
        ExposeCommand.prototype.getLabels = function () {
            var ret = this.id;
            if(this.label) {
                ret += ' (' + this.label + ')';
            }
            if(this.hint) {
                var arr = [];
                xm.eachProp(this.hint, function (label, id) {
                    arr.push('     --' + id + ' ' + label + '');
                });
                if(arr.length > 0) {
                    ret += '\n' + arr.join('\n');
                }
            }
            return ret;
        };
        return ExposeCommand;
    })();    
    var Expose = (function () {
        function Expose() {
            var _this = this;
            this._commands = new xm.KeyValueMap();
            this.add('help', function () {
                console.log('available commands:');
                xm.eachProp(_this._commands.keys().sort(), function (id) {
                    console.log('   ' + _this._commands.get(id).getLabels());
                });
            }, 'usage help');
        }
        Expose.prototype.executeArgv = function (argv, alt) {
            if(!argv || argv._.length === 0) {
                if(alt && this._commands.has(alt)) {
                    this.execute(alt);
                }
                this.execute('help');
            } else {
                if(this.has(argv._[0])) {
                    this.execute(argv._[0], argv);
                } else {
                    console.log('command not found: ' + argv._[0]);
                    this.execute('help');
                }
            }
        };
        Expose.prototype.execute = function (id, args, head) {
            if (typeof args === "undefined") { args = null; }
            if (typeof head === "undefined") { head = true; }
            if(!this._commands.has(id)) {
                console.log('\nunknown command ' + id + '\n');
                return;
            }
            if(head) {
                console.log('\n-> ' + id + '\n');
            }
            var f = this._commands.get(id);
            f.execute.call(null, args);
        };
        Expose.prototype.add = function (id, def, label, hint) {
            if(this._commands.has(id)) {
                throw new Error('id collision on ' + id);
            }
            this._commands.set(id, new ExposeCommand(id, def, label, hint));
        };
        Expose.prototype.has = function (id) {
            return this._commands.has(id);
        };
        Expose.prototype.map = function (id, to) {
            var self = this;
            this.add(id, function () {
                self.execute(to, false);
            });
        };
        return Expose;
    })();
    xm.Expose = Expose;    
})(xm || (xm = {}));
var tsd;
(function (tsd) {
    var exp = {
        tsd: tsd,
        xm: xm
    };
    exports = (module).exports = exp;
    var isMain = (module) && require.main === (module);
    if(isMain || process.env['tsd-expose']) {
        var fs = require('fs');
        var path = require('path');
        var util = require('util');
        var async = require('async');
        var expose = new xm.Expose();
        expose.add('info', function (args) {
        }, 'print tool info');
        if(isMain) {
            expose.execute('info');
            var argv = require('optimist').argv;
            expose.executeArgv(argv, 'info');
        }
    }
})(tsd || (tsd = {}));
