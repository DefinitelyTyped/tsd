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
            WebRequest.prototype.verifyInit = function () {
                if(!this._initialized) {
                    throw new Error('WebRequest was not initialized.');
                }
            };
            WebRequest.prototype.init = function (tty) {
                this._tty = tty;
                this._initialized = true;
            };
            WebRequest.prototype.getUrl = function (url, callback) {
                var _this = this;
                this.verifyInit();
                this._tty.writeLine("tsd {{=green}}http {{=magenta}}GET{{=reset}} " + url);
                this._request(url, function (error, response, body) {
                    _this._tty.writeLine("tsd {{=green}}http {{=magenta}}" + response.statusCode + "{{=reset}} " + url);
                    if(!error && response.statusCode == 200) {
                        callback(body);
                    } else {
                        _this._tty.writeLine("tsd {{=red}}ERR! {{=magenta}}" + response.statusCode + " {{=reset}}" + error);
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

var Util;
(function (Util) {
    var tmpl;
    (function () {
        var cache = {
        };
        tmpl = function (str, data) {
            var fn = !/\W/.test(str) ? cache[str] = cache[str] || tmpl(document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("{{").join("\t").replace(/((^|\}\})[^\t]*)'/g, "$1\r").replace(/\t=(.*?)\}\}/g, "',$1,'").split("\t").join("');").split("}}").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
            return data ? fn(data) : fn;
        };
    })();
    var Colors = (function () {
        function Colors() { }
        Colors.Black = 0;
        Colors.Red = 1;
        Colors.Green = 2;
        Colors.Yellow = 3;
        Colors.Blue = 4;
        Colors.Magenta = 5;
        Colors.Cyan = 6;
        Colors.White = 7;
        Colors.Default = 9;
        Colors.Bright = {
            On: 1,
            Off: 22
        };
        Colors.Bold = {
            On: 1,
            Off: 22
        };
        Colors.Italics = {
            On: 3,
            Off: 23
        };
        Colors.Underline = {
            On: 4,
            Off: 24
        };
        Colors.Inverse = {
            On: 7,
            Off: 27
        };
        Colors.Strikethrough = {
            On: 9,
            Off: 29
        };
        return Colors;
    })();    
    var Terminal = (function () {
        function Terminal() { }
        Terminal._reset = 0;
        Terminal._foreground = function _foreground(color) {
            return "3" + color;
        }
        Terminal._background = function _background(color) {
            return "4" + color;
        }
        Terminal._makeANSI = function _makeANSI(code) {
            return '\033[' + code + 'm';
        }
        Terminal._environment = {
            'reset': Terminal._makeANSI(Terminal._reset),
            'bold': Terminal._makeANSI(Colors.Bold.On),
            'nobold': Terminal._makeANSI(Colors.Bold.Off),
            'bright': Terminal._makeANSI(Colors.Bright.On),
            'nobright': Terminal._makeANSI(Colors.Bright.Off),
            'italics': Terminal._makeANSI(Colors.Italics.On),
            'noitalics': Terminal._makeANSI(Colors.Italics.Off),
            'underline': Terminal._makeANSI(Colors.Underline.On),
            'nounderline': Terminal._makeANSI(Colors.Underline.Off),
            'inverse': Terminal._makeANSI(Colors.Inverse.On),
            'noinverse': Terminal._makeANSI(Colors.Inverse.Off),
            'strikethrough': Terminal._makeANSI(Colors.Strikethrough.On),
            'nostrikethrough': Terminal._makeANSI(Colors.Strikethrough.Off),
            'black': Terminal._makeANSI(Terminal._foreground(Colors.Black)),
            'red': Terminal._makeANSI(Terminal._foreground(Colors.Red)),
            'green': Terminal._makeANSI(Terminal._foreground(Colors.Green)),
            'yellow': Terminal._makeANSI(Terminal._foreground(Colors.Yellow)),
            'blue': Terminal._makeANSI(Terminal._foreground(Colors.Blue)),
            'magenta': Terminal._makeANSI(Terminal._foreground(Colors.Magenta)),
            'cyan': Terminal._makeANSI(Terminal._foreground(Colors.Cyan)),
            'white': Terminal._makeANSI(Terminal._foreground(Colors.White)),
            'default': Terminal._makeANSI(Terminal._foreground(Colors.Default)),
            'bgblack': Terminal._makeANSI(Terminal._background(Colors.Black)),
            'bgred': Terminal._makeANSI(Terminal._background(Colors.Red)),
            'bggreen': Terminal._makeANSI(Terminal._background(Colors.Green)),
            'bgyellow': Terminal._makeANSI(Terminal._background(Colors.Yellow)),
            'bgblue': Terminal._makeANSI(Terminal._background(Colors.Blue)),
            'bgmagenta': Terminal._makeANSI(Terminal._background(Colors.Magenta)),
            'bgcyan': Terminal._makeANSI(Terminal._background(Colors.Cyan)),
            'bgwhite': Terminal._makeANSI(Terminal._background(Colors.White)),
            'bgdefault': Terminal._makeANSI(Terminal._background(Colors.Default))
        };
        Terminal.ANSIFormat = function ANSIFormat(text) {
            return tmpl(text, Terminal._environment);
        }
        return Terminal;
    })();
    Util.Terminal = Terminal;    
})(Util || (Util = {}));

var TTY = (function () {
    function TTY() { }
    TTY.prototype.beep = function () {
    };
    TTY.prototype.write = function (value) {
        process.stdout.write(Util.Terminal.ANSIFormat(value));
    };
    TTY.prototype.writeLine = function (value) {
        this.write(value + '\n');
        process.stdout.write('\n');
    };
    TTY.prototype.error = function (message) {
        this.writeLine("{{=red}}" + message + "{{=reset}}");
    };
    TTY.prototype.warn = function (message) {
        this.writeLine("{{=yellow}}" + message + "{{=reset}}");
    };
    return TTY;
})();
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
        function AllCommand(tty, dataSource) {
            this.tty = tty;
            this.dataSource = dataSource;
            this.shortcut = "all";
            this.usage = "Show all file definitions from repository";
        }
        AllCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        AllCommand.prototype.print = function (lib) {
            this.tty.write(" {{=cyan}}" + lib.name + " {{=yellow}}[{{=cyan}}");
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    this.tty.write("{{=yellow}},{{=cyan}} ");
                }
                var ver = lib.versions[j];
                this.tty.write(ver.version);
            }
            this.tty.write("{{=yellow}}]{{=reset}}");
            this.tty.writeLine(" - " + lib.description);
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
        function SearchCommand(tty, dataSource) {
            this.tty = tty;
            this.dataSource = dataSource;
            this.shortcut = "search";
            this.usage = "Search a file definition on repository";
        }
        SearchCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        SearchCommand.prototype.print = function (lib) {
            this.tty.write(" {{=cyan}}" + lib.name + " {{=yellow}}[{{=cyan}}");
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    this.tty.write("{{=yellow}},{{=cyan}} ");
                }
                var ver = lib.versions[j];
                this.tty.write(ver.version);
            }
            this.tty.write("{{=yellow}}]{{=reset}}");
            this.tty.writeLine(" - " + lib.description);
        };
        SearchCommand.prototype.match = function (key, name) {
            return name.indexOf(key) != -1;
        };
        SearchCommand.prototype.printIfMatch = function (lib, args) {
            var found = false;
            for(var i = 3; i < args.length; i++) {
                var key = args[i];
                Util.Trace.log("arg[" + i + "]: " + key);
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
                _this.tty.writeLine("{{=cyan}}Search results:{{=reset}}");
                _this.tty.writeLine("");
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    Util.Trace.log("test match for lib: " + lib.name);
                    if(_this.printIfMatch(lib, args)) {
                        found = true;
                    }
                }
                if(!found) {
                    _this.tty.warn("No results found.");
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
        function InstallCommand(tty, dataSource, io, cfg) {
            this.tty = tty;
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
            this.tty.write(" {{=cyan}}" + lib.name + "{{=reset}} - " + lib.description + " {{=yellow}}[{{=cyan}}");
            for(var j = 0; j < lib.versions.length; j++) {
                if(j > 0 && j < lib.versions.length) {
                    this.tty.write("{{=yellow}},{{=cyan}} ");
                }
                var ver = lib.versions[j];
                this.tty.write(ver.version);
            }
            this.tty.writeLine("{{=yellow}}]{{=reset}}");
        };
        InstallCommand.prototype.match = function (key, name) {
            return name.toUpperCase() == key.toUpperCase();
        };
        InstallCommand.prototype.save = function (name, version, key, content) {
            if(!this.io.directoryExists(this.cfg.localPath)) {
                this.io.createDirectory(this.cfg.localPath);
            }
            this.io.createFile(this.cfg.localPath + "\\" + name + "-" + version + ".d.ts", content);
            this.tty.writeLine("└── " + name + "@" + version + " instaled.");
            this.io.createFile(this.cfg.localPath + "\\" + name + "-" + version + ".d.key", key);
            this.tty.writeLine("     └── " + key + ".key");
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
                this.tty.warn("Lib not found.");
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
                _this.tty.writeLine("");
                var targetLib = _this.find(args[3], libs);
                if(targetLib) {
                    _this.install(targetLib, targetLib.versions[0].version, libs);
                } else {
                    _this.tty.warn("Lib not found.");
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
    function CommandLineProcessor(tty, dataSource, io, cfg) {
        this.tty = tty;
        this.dataSource = dataSource;
        this.io = io;
        this.cfg = cfg;
        this.commands = [];
        this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(this.tty, this.dataSource));
        this.commands.push(new Command.SearchCommand(this.tty, this.dataSource));
        this.commands.push(new Command.InstallCommand(this.tty, this.dataSource, this.io, this.cfg));
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

var Util;
(function (Util) {
    var Trace = (function () {
        function Trace() { }
        Trace.debug = false;
        Trace.tty = null;
        Trace.log = function log(msg) {
            if(this.debug) {
                if(this.tty != null) {
                    this.tty.writeLine("{{=yellow}}TRACE{{=reset}}: " + msg);
                }
            }
        }
        return Trace;
    })();
    Util.Trace = Trace;    
})(Util || (Util = {}));

var Main = (function () {
    function Main() { }
    Main.prototype.init = function () {
        System.Console.initialize();
    };
    Main.prototype.run = function (args) {
        Util.Trace.debug = false;
        var tty = new TTY();
        Util.Trace.tty = tty;
        try  {
            System.Web.WebRequest.instance().init(tty);
            var cfg = new Config();
            cfg.repositoryType = RepositoryTypeEnum.Web;
            cfg.uri = "https://github.com/Diullei/tsd/raw/master/deploy/repository.json";
            cfg.localPath = "./d.ts";
            var ds = DataSource.DataSourceFactory.factory(cfg);
            var cp = new CommandLineProcessor(tty, ds, new IO(), cfg);
            cp.execute(args);
        } catch (e) {
            tty.error(e.message);
        }
    };
    return Main;
})();
var main = new Main();
main.init();
main.run(Array.prototype.slice.call(process.argv));
