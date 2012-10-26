var System;
(function (System) {
    var Environment = (function () {
        function Environment() { }
        Environment.isNode = function isNode() {
            return !(typeof ActiveXObject === "function");
        }
        Environment.isWsh = function isWsh() {
            return !Environment.isNode();
        }
        return Environment;
    })();
    System.Environment = Environment;    
})(System || (System = {}));

var System;
(function (System) {
    
})(System || (System = {}));

var System;
(function (System) {
    (function (IO) {
        var StreamWriter = (function () {
            function StreamWriter() {
                this.autoFlush = true;
            }
            StreamWriter.prototype.flush = function () {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.flushAsync = function (callback) {
                throw new Error("Not Implemented Exception");
            };
            StreamWriter.prototype.write = function (value) {
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flush();
                    this._buffer = null;
                }
            };
            StreamWriter.prototype.writeLine = function (value) {
                this.write(value + '\n');
            };
            StreamWriter.prototype.writeAsync = function (value, callback) {
                var _this = this;
                if(!this._buffer) {
                    this._buffer = '';
                }
                this._buffer += value;
                if(this.autoFlush) {
                    this.flushAsync(function () {
                        _this._buffer = null;
                        callback();
                    });
                }
            };
            StreamWriter.prototype.writeLineAsync = function (value, callback) {
                this.writeAsync(value + '\n', callback);
            };
            StreamWriter.prototype.dispose = function () {
                throw new Error("Not Implemented Exception");
            };
            return StreamWriter;
        })();
        IO.StreamWriter = StreamWriter;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;

})(System || (System = {}));

var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var NodeJs;
(function (NodeJs) {
    var ConsoleWriter = (function (_super) {
        __extends(ConsoleWriter, _super);
        function ConsoleWriter() {
            _super.apply(this, arguments);

        }
        ConsoleWriter.prototype.flush = function () {
            process.stdout.write(this._buffer);
        };
        ConsoleWriter.prototype.flushAsync = function (callback) {
            this.flush();
            callback();
        };
        ConsoleWriter.prototype.dispose = function () {
            throw new Error("Not Implemented Exception");
        };
        return ConsoleWriter;
    })(System.IO.StreamWriter);
    NodeJs.ConsoleWriter = ConsoleWriter;    
})(NodeJs || (NodeJs = {}));

var System;
(function (System) {
    var Console = (function () {
        function Console() { }
        Console.out = null;
        Console.initialize = function initialize() {
            if(System.Environment.isNode()) {
                Console.out = new NodeJs.ConsoleWriter();
            } else {
                if(System.Environment.isWsh()) {
                } else {
                    throw new Error('Invalid host');
                }
            }
        }
        Console.write = function write(value) {
            Console.out.write(value);
        }
        Console.writeLine = function writeLine(value) {
            Console.out.writeLine(value);
        }
        Console.writeAsync = function writeAsync(value, callback) {
            Console.out.writeAsync(value, callback);
        }
        Console.writeLineAsync = function writeLineAsync(value, callback) {
            Console.out.writeLineAsync(value, callback);
        }
        return Console;
    })();
    System.Console = Console;    
})(System || (System = {}));

var System;
(function (System) {
    (function (Web) {
        var WebRequest = (function () {
            function WebRequest() {
                this._request = require('request');
                this._initialized = false;
            }
            WebRequest._instance = null;
            WebRequest.prototype.getUrl = function (url, callback) {
                System.Console.writeLine("tsd http GET " + url);
                this._request(url, function (error, response, body) {
                    System.Console.writeLine("tsd http " + response.statusCode + " " + url);
                    if(!error && response.statusCode == 200) {
                        callback(body);
                    } else {
                        System.Console.writeLine("tsd ERR! " + response.statusCode + " " + error);
                    }
                });
            };
            WebRequest.instance = function instance() {
                if(WebRequest._instance == null) {
                    WebRequest._instance = new WebRequest();
                }
                return WebRequest._instance;
            }
            return WebRequest;
        })();
        Web.WebRequest = WebRequest;        
    })(System.Web || (System.Web = {}));
    var Web = System.Web;

})(System || (System = {}));

var _fs = require('fs');
var _path = require('path');
var _module = require('module');
var IO = (function () {
    function IO() { }
    IO.prototype.readFile = function (file) {
        var buffer = _fs.readFileSync(file);
        switch(buffer[0]) {
            case 254: {
                if(buffer[1] == 255) {
                    var i = 0;
                    while((i + 1) < buffer.length) {
                        var temp = buffer[i];
                        buffer[i] = buffer[i + 1];
                        buffer[i + 1] = temp;
                        i += 2;
                    }
                    return buffer.toString("ucs2", 2);
                }
                break;

            }
            case 255: {
                if(buffer[1] == 254) {
                    return buffer.toString("ucs2", 2);
                }
                break;

            }
            case 239: {
                if(buffer[1] == 187) {
                    return buffer.toString("utf8", 3);
                }

            }
        }
        return buffer.toString();
    };
    IO.prototype.createFile = function (path, contents) {
        _fs.writeFileSync(path, contents);
    };
    IO.prototype.deleteFile = function (path) {
        try  {
            _fs.unlinkSync(path);
        } catch (e) {
        }
    };
    IO.prototype.fileExists = function (path) {
        return _fs.existsSync(path);
    };
    IO.prototype.directoryExists = function (path) {
        return _fs.existsSync(path) && _fs.lstatSync(path).isDirectory();
    };
    IO.prototype.createDirectory = function (path) {
        if(!this.directoryExists(path)) {
            _fs.mkdirSync(path);
        }
    };
    IO.prototype.dirName = function (path) {
        return _path.dirname(path);
    };
    return IO;
})();
var RepositoryTypeEnum;
(function (RepositoryTypeEnum) {
    RepositoryTypeEnum._map = [];
    RepositoryTypeEnum._map[0] = "FileSystem";
    RepositoryTypeEnum.FileSystem = 0;
    RepositoryTypeEnum._map[1] = "Web";
    RepositoryTypeEnum.Web = 1;
})(RepositoryTypeEnum || (RepositoryTypeEnum = {}));

var Config = (function () {
    function Config() { }
    Config.prototype.load = function (cfgFile) {
    };
    return Config;
})();
var DataSource;
(function (DataSource) {
    var WebDataSource = (function () {
        function WebDataSource(repositoryUrl) {
            this.repositoryUrl = repositoryUrl;
        }
        WebDataSource.prototype.all = function (callback) {
            var request = System.Web.WebRequest.instance();
            request.getUrl(this.repositoryUrl, function (body) {
                callback(JSON.parse(body));
            });
        };
        WebDataSource.prototype.find = function (keys) {
            return null;
        };
        return WebDataSource;
    })();
    DataSource.WebDataSource = WebDataSource;    
})(DataSource || (DataSource = {}));

var DataSource;
(function (DataSource) {
    var FileSystemDataSource = (function () {
        function FileSystemDataSource(repositoryPath) {
            this.repositoryPath = repositoryPath;
            this._fs = require('fs');
        }
        FileSystemDataSource.prototype.all = function (callback) {
            this._fs.readFile(this.repositoryPath, function (err, data) {
                if(err) {
                    throw err;
                }
                callback(JSON.parse(data));
            });
        };
        FileSystemDataSource.prototype.find = function (keys) {
            return null;
        };
        return FileSystemDataSource;
    })();
    DataSource.FileSystemDataSource = FileSystemDataSource;    
})(DataSource || (DataSource = {}));

var DataSource;
(function (DataSource) {
    var LibVersion = (function () {
        function LibVersion() {
            this.dependencies = [];
        }
        return LibVersion;
    })();
    DataSource.LibVersion = LibVersion;    
    var Lib = (function () {
        function Lib() {
            this.versions = new Array();
        }
        return Lib;
    })();
    DataSource.Lib = Lib;    
    var LibContent = (function () {
        function LibContent() { }
        return LibContent;
    })();
    DataSource.LibContent = LibContent;    
})(DataSource || (DataSource = {}));

var Command;
(function (Command) {
    var HelpCommand = (function () {
        function HelpCommand() {
            this.shortcut = "-h";
            this.usage = "Print this help message";
        }
        HelpCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        HelpCommand.prototype.exec = function (args) {
        };
        HelpCommand.prototype.toString = function () {
            return this.shortcut + "        " + this.usage;
        };
        return HelpCommand;
    })();
    Command.HelpCommand = HelpCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var AllCommand = (function () {
        function AllCommand(dataSource) {
            this.dataSource = dataSource;
            this.shortcut = "all";
            this.usage = "Show all file definitions from repository";
        }
        AllCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        AllCommand.prototype.print = function (lib) {
            System.Console.write(lib.name + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.write(']');
            System.Console.writeLine(' - ' + lib.description);
        };
        AllCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    _this.print(lib);
                }
            });
        };
        AllCommand.prototype.toString = function () {
            return this.shortcut + "       " + this.usage;
        };
        return AllCommand;
    })();
    Command.AllCommand = AllCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var SearchCommand = (function () {
        function SearchCommand(dataSource) {
            this.dataSource = dataSource;
            this.shortcut = "search";
            this.usage = "Search a file definition on repository";
        }
        SearchCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        SearchCommand.prototype.print = function (lib) {
            System.Console.write(" " + lib.name + " [");
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(", ");
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.write("]");
            System.Console.writeLine(" - " + lib.description);
        };
        SearchCommand.prototype.match = function (key, name) {
            return name.indexOf(key) != -1;
        };
        SearchCommand.prototype.printIfMatch = function (lib, args) {
            var found = false;
            for(var i = 3; i < args.length; i++) {
                var key = args[i];
                if(this.match(key, lib.name)) {
                    this.print(lib);
                    found = true;
                }
            }
            return found;
        };
        SearchCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                var found = false;
                System.Console.writeLine("Search results:");
                System.Console.writeLine("");
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    if(_this.printIfMatch(lib, args)) {
                        found = true;
                    }
                }
                if(!found) {
                    System.Console.writeLine("No results found.");
                }
            });
        };
        SearchCommand.prototype.toString = function () {
            return this.shortcut + "    " + this.usage;
        };
        return SearchCommand;
    })();
    Command.SearchCommand = SearchCommand;    
})(Command || (Command = {}));

var Command;
(function (Command) {
    var InstallCommand = (function () {
        function InstallCommand(dataSource, io, cfg) {
            this.dataSource = dataSource;
            this.io = io;
            this.cfg = cfg;
            this.shortcut = "install";
            this.usage = "Intall file definition";
            this._cache = [];
            this._request = System.Web.WebRequest.instance();
            this._index = 0;
        }
        InstallCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        InstallCommand.prototype.print = function (lib) {
            System.Console.write(lib.name + ' - ' + lib.description + '[');
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }
            System.Console.writeLine(']');
        };
        InstallCommand.prototype.match = function (key, name) {
            return name.toUpperCase() == key.toUpperCase();
        };
        InstallCommand.prototype.save = function (name, version, key, content) {
            if(!this.io.directoryExists(this.cfg.localPath)) {
                this.io.createDirectory(this.cfg.localPath);
            }
            this.io.createFile(this.cfg.localPath + "\\" + name + "-" + version + ".d.ts", content);
            System.Console.writeLine("└── " + name + "@" + version + " instaled.");
            this.io.createFile(this.cfg.localPath + "\\" + name + "-" + version + ".d.key", key);
            System.Console.writeLine("     └── " + key + ".key");
        };
        InstallCommand.prototype.find = function (key, libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(this.match(lib.name, key)) {
                    return lib;
                }
            }
            return null;
        };
        InstallCommand.prototype.cacheContains = function (name) {
            for(var i = 0; i < this._cache.length; i++) {
                if(this._cache[i] == name) {
                    return true;
                }
            }
            return false;
        };
        InstallCommand.prototype.install = function (targetLib, targetVersion, libs) {
            var _this = this;
            if(this.cacheContains(targetLib.name + '@' + targetVersion)) {
                return;
            }
            if(targetLib == null) {
                System.Console.writeLine("Lib not found.");
            } else {
                var version = targetLib.versions[0];
                this._request.getUrl(version.url, function (body) {
                    _this.save(targetLib.name, version.version, version.key, body);
                    _this._cache.push(targetLib.name + '@' + version.version);
                    var deps = (targetLib.versions[0].dependencies) || [];
                    for(var i = 0; i < deps.length; i++) {
                        var dep = _this.find(deps[i].name, libs);
                        _this.install(dep, dep.versions[0].version, libs);
                    }
                });
            }
        };
        InstallCommand.prototype.exec = function (args) {
            var _this = this;
            this.dataSource.all(function (libs) {
                System.Console.writeLine("");
                var targetLib = _this.find(args[3], libs);
                if(targetLib) {
                    _this.install(targetLib, targetLib.versions[0].version, libs);
                } else {
                    System.Console.writeLine("Lib not found.");
                }
            });
        };
        InstallCommand.prototype.toString = function () {
            return this.shortcut + "   " + this.usage;
        };
        return InstallCommand;
    })();
    Command.InstallCommand = InstallCommand;    
})(Command || (Command = {}));

var CommandLineProcessor = (function () {
    function CommandLineProcessor(dataSource, io, cfg) {
        this.dataSource = dataSource;
        this.io = io;
        this.cfg = cfg;
        this.commands = [];
        this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(this.dataSource));
        this.commands.push(new Command.SearchCommand(this.dataSource));
        this.commands.push(new Command.InstallCommand(this.dataSource, this.io, this.cfg));
    }
    CommandLineProcessor.prototype.printUsage = function () {
        System.Console.out.autoFlush = false;
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('   Ex.: tsd search nodejs');
        System.Console.writeLine('');
        System.Console.writeLine('Options:');
        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine("  " + this.commands[i].toString());
        }
        System.Console.out.flush();
    };
    CommandLineProcessor.prototype.execute = function (args) {
        System.Console.writeLine("Command: " + (args[2] || "..."));
        System.Console.writeLine('');
        var accepted = false;
        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof Command.HelpCommand) {
                    this.printUsage();
                } else {
                    command.exec(args);
                }
            }
        }
        if(!accepted) {
            this.printUsage();
        }
    };
    return CommandLineProcessor;
})();
var DataSource;
(function (DataSource) {
    var DataSourceFactory = (function () {
        function DataSourceFactory() { }
        DataSourceFactory.factory = function factory(cfg) {
            if(cfg.repositoryType == RepositoryTypeEnum.FileSystem) {
                return new DataSource.FileSystemDataSource(cfg.uri);
            } else {
                if(cfg.repositoryType == RepositoryTypeEnum.Web) {
                    return new DataSource.WebDataSource(cfg.uri);
                } else {
                    throw Error('Invalid dataSource.');
                }
            }
        }
        return DataSourceFactory;
    })();
    DataSource.DataSourceFactory = DataSourceFactory;    
})(DataSource || (DataSource = {}));

var Main = (function () {
    function Main() { }
    Main.prototype.init = function () {
        System.Console.initialize();
    };
    Main.prototype.run = function (args) {
        try  {
            var cfg = new Config();
            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";
            cfg.localPath = "./d.ts";
            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(ds, new IO(), cfg);
            cp.execute(args);
        } catch (e) {
            System.Console.writeLine(e.message);
        }
    };
    return Main;
})();
var main = new Main();
main.init();
main.run(Array.prototype.slice.call(process.argv));
