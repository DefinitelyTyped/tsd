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
var ConsoleTTY = (function () {
    function ConsoleTTY() { }
    ConsoleTTY.prototype.beep = function () {
    };
    ConsoleTTY.prototype.write = function (value) {
        process.stdout.write(Terminal.ANSIFormat(value));
    };
    ConsoleTTY.prototype.writeLine = function (value) {
        this.write(value + '\n');
        process.stdout.write('\n');
    };
    ConsoleTTY.prototype.error = function (message) {
        this.writeLine("{{=red}}" + message + "{{=reset}}");
    };
    ConsoleTTY.prototype.warn = function (message) {
        this.writeLine("{{=yellow}}" + message + "{{=reset}}");
    };
    return ConsoleTTY;
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
var WebDataSource = (function () {
    function WebDataSource(repositoryUrl) {
        this.repositoryUrl = repositoryUrl;
        this._request = require('request');
    }
    WebDataSource.prototype.all = function (callback) {
        return null;
    };
    WebDataSource.prototype.find = function (keys) {
        return null;
    };
    WebDataSource.prototype.get = function (query) {
        return null;
    };
    return WebDataSource;
})();
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
        return null;
    };
    FileSystemDataSource.prototype.find = function (keys) {
        return null;
    };
    FileSystemDataSource.prototype.get = function (query) {
        return null;
    };
    return FileSystemDataSource;
})();
var LibVersion = (function () {
    function LibVersion() {
        this.dependencies = new Array();
    }
    return LibVersion;
})();
var Lib = (function () {
    function Lib() {
        this.versions = new Array();
    }
    return Lib;
})();
var LibContent = (function () {
    function LibContent() { }
    return LibContent;
})();
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
    AllCommand.prototype.exec = function (args) {
        var _this = this;
        this.dataSource.all(function (libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                _this.tty.write(" " + lib.name + " - " + lib.description + " [");
                for(var j = 0; j < lib.versions.length; j++) {
                    if(j > 0 && j < lib.versions.length) {
                        _this.tty.write(", ");
                    }
                    var ver = lib.versions[j];
                    _this.tty.write(ver.version);
                }
                _this.tty.writeLine("]");
            }
        });
    };
    AllCommand.prototype.toString = function () {
        return this.shortcut + "       " + this.usage;
    };
    return AllCommand;
})();
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
    SearchCommand.prototype.match = function (key, name) {
        return name.indexOf(key) != -1;
    };
    SearchCommand.prototype.printIfMatch = function (lib, args) {
        var found = false;
        for(var i = 0; i < args.length; i++) {
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
            _this.tty.writeLine("{{=cyan}}Search results:{{=reset}}");
            _this.tty.writeLine("");
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
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
var InstallCommand = (function () {
    function InstallCommand(tty, dataSource, io, cfg) {
        this.tty = tty;
        this.dataSource = dataSource;
        this.io = io;
        this.cfg = cfg;
        this.shortcut = "install";
        this.usage = "Intall file definition";
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
    InstallCommand.prototype.exec = function (args) {
        var _this = this;
        this.dataSource.all(function (libs) {
            var targetLib = null;
            _this.tty.writeLine("");
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(_this.match(lib.name, args[3])) {
                    targetLib = lib;
                    break;
                }
            }
            if(targetLib == null) {
                _this.tty.warn("Lib not found.");
            } else {
                var version = targetLib.versions[0];
                var request = require('request');
                request(version.url, function (error, response, body) {
                    if(!error && response.statusCode == 200) {
                        if(!_this.io.directoryExists(_this.cfg.localPath)) {
                            _this.io.createDirectory(_this.cfg.localPath);
                        }
                        _this.io.createFile(_this.cfg.localPath + "\\" + targetLib.name + "-" + version.version + ".d.ts", body);
                        _this.tty.write(targetLib.name + " instaled.");
                    }
                });
            }
        });
    };
    InstallCommand.prototype.toString = function () {
        return this.shortcut + "   " + this.usage;
    };
    return InstallCommand;
})();
var CommandLineProcessor = (function () {
    function CommandLineProcessor(tty, dataSource, io, cfg) {
        this.tty = tty;
        this.dataSource = dataSource;
        this.io = io;
        this.cfg = cfg;
        this.commands = new Array();
        this.commands.push(new HelpCommand());
        this.commands.push(new AllCommand(this.tty, this.dataSource));
        this.commands.push(new SearchCommand(this.tty, this.dataSource));
        this.commands.push(new InstallCommand(this.tty, this.dataSource, this.io, this.cfg));
    }
    CommandLineProcessor.prototype.printUsage = function () {
        this.tty.writeLine("{{=cyan}}Syntax:{{=reset}}   tsd {{=yellow}}[{{=cyan}}command{{=yellow}}] [{{=cyan}}args...{{=yellow}}]{{=reset}}");
        this.tty.writeLine("");
        this.tty.writeLine("   {{=cyan}}Ex.:{{=reset}} tsd search nodejs");
        this.tty.writeLine("");
        this.tty.writeLine("{{=cyan}}Options:{{=reset}}");
        for(var i = 0; i < this.commands.length; i++) {
            this.tty.writeLine("  " + this.commands[i].toString());
        }
    };
    CommandLineProcessor.prototype.execute = function (args) {
        var accepted = false;
        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof HelpCommand) {
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
var DataSourceFactory = (function () {
    function DataSourceFactory() { }
    DataSourceFactory.factory = function factory(cfg) {
        if(cfg.repositoryType == RepositoryTypeEnum.FileSystem) {
            return new FileSystemDataSource(cfg.uri);
        } else {
            if(cfg.repositoryType == RepositoryTypeEnum.Web) {
                return new WebDataSource(cfg.uri);
            } else {
                throw Error('Invalid dataSource.');
            }
        }
    }
    return DataSourceFactory;
})();
var args = Array.prototype.slice.call(process.argv);
var cfg = new Config();
cfg.repositoryType = RepositoryTypeEnum.FileSystem;
cfg.uri = "./repository.json";
cfg.localPath = "./d.ts";
var ds = DataSourceFactory.factory(cfg);
var cp = new CommandLineProcessor(new ConsoleTTY(), ds, new IO(), cfg);
cp.execute(args);
