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
        function API() { }
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
            var str;
            try  {
                str = JSON.stringify(data, null, 4);
            } catch (err) {
                return callback(err, null);
            }
            fs.writeFileSync(path.resolve(src), str, 'utf8');
        };
        FileUtil.writeJSON = function writeJSON(src, data, callback) {
            var str;
            try  {
                str = JSON.stringify(data, null, 4);
            } catch (err) {
                return callback(err, null);
            }
            fs.writeFile(path.resolve(src), str, 'utf8', callback);
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
            this.cache = path.join(process.cwd(), 'tsd');
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
    var Selector = (function () {
        function Selector() {
        }
        return Selector;
    })();
    xm.Selector = Selector;    
})(xm || (xm = {}));
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
