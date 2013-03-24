var System;
(function (System) {
    var Environment = (function () {
        function Environment() { }
        Environment.isNode = function isNode() {
            return !(typeof ActiveXObject === "function");
        };
        Environment.isWsh = function isWsh() {
            return !Environment.isNode();
        };
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
            StreamWriter.prototype.close = function () {
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
};
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
var Wsh;
(function (Wsh) {
    var ConsoleWriter = (function (_super) {
        __extends(ConsoleWriter, _super);
        function ConsoleWriter() {
            _super.apply(this, arguments);

        }
        ConsoleWriter.prototype.flush = function () {
            WScript.StdOut.Write(this._buffer);
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
    Wsh.ConsoleWriter = ConsoleWriter;    
})(Wsh || (Wsh = {}));
var System;
(function (System) {
    var Console = (function () {
        function Console() { }
        Console.initialize = function initialize() {
            if(System.Environment.isNode()) {
                Console.out = new NodeJs.ConsoleWriter();
            } else if(System.Environment.isWsh()) {
                Console.out = new Wsh.ConsoleWriter();
            } else {
                throw new Error('Invalid host');
            }
        };
        Console.write = function write(value) {
            Console.out.write(value);
        };
        Console.writeLine = function writeLine(value) {
            Console.out.writeLine(value);
        };
        Console.writeAsync = function writeAsync(value, callback) {
            Console.out.writeAsync(value, callback);
        };
        Console.writeLineAsync = function writeLineAsync(value, callback) {
            Console.out.writeLineAsync(value, callback);
        };
        return Console;
    })();
    System.Console = Console;    
})(System || (System = {}));
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var FileStreamWriter = (function (_super) {
        __extends(FileStreamWriter, _super);
        function FileStreamWriter(path) {
                _super.call(this);
            this.path = path;
            this._fs = require('fs');
            this.autoFlush = false;
        }
        FileStreamWriter.prototype.flush = function () {
            this._fs.appendFileSync(this.path, this._buffer);
        };
        FileStreamWriter.prototype.flushAsync = function (callback) {
            this._fs.writeFile(this.path, this._buffer, function (err) {
                if(err) {
                    throw err;
                }
                callback();
            });
        };
        FileStreamWriter.prototype.close = function () {
        };
        return FileStreamWriter;
    })(System.IO.StreamWriter);    
    var FileHandle = (function () {
        function FileHandle() {
            this._fs = require('fs');
        }
        FileHandle.prototype.readFile = function (file) {
            var buffer = this._fs.readFileSync(file);
            switch(buffer[0]) {
                case 0xFE:
                    if(buffer[1] == 0xFF) {
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
                case 0xFF:
                    if(buffer[1] == 0xFE) {
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xEF:
                    if(buffer[1] == 0xBB) {
                        return buffer.toString("utf8", 3);
                    }
            }
            return buffer.toString();
        };
        FileHandle.prototype.createFile = function (path) {
            this._fs.writeFileSync(path, '');
            return new FileStreamWriter(path);
        };
        FileHandle.prototype.deleteFile = function (path) {
            try  {
                this._fs.unlinkSync(path);
            } catch (e) {
            }
        };
        FileHandle.prototype.fileExists = function (path) {
            return this._fs.existsSync(path);
        };
        return FileHandle;
    })();
    NodeJs.FileHandle = FileHandle;    
})(NodeJs || (NodeJs = {}));
var Wsh;
(function (Wsh) {
    var FileStreamWriter = (function (_super) {
        __extends(FileStreamWriter, _super);
        function FileStreamWriter(streamObj, path, streamObjectPool) {
                _super.call(this);
            this.streamObj = streamObj;
            this.path = path;
            this.autoFlush = false;
            this._streamObjectPool = streamObjectPool;
        }
        FileStreamWriter.prototype.releaseStreamObject = function (obj) {
            this._streamObjectPool.push(obj);
        };
        FileStreamWriter.prototype.flush = function () {
            this.streamObj.WriteText(this._buffer, 0);
        };
        FileStreamWriter.prototype.flushAsync = function (callback) {
            this.streamObj.WriteText(this._buffer, 0);
            callback();
        };
        FileStreamWriter.prototype.close = function () {
            this.streamObj.SaveToFile(this.path, 2);
            this.streamObj.Close();
            this.releaseStreamObject(this.streamObj);
        };
        return FileStreamWriter;
    })(System.IO.StreamWriter);    
    var FileHandle = (function () {
        function FileHandle() {
            this._fso = new ActiveXObject("Scripting.FileSystemObject");
            this._streamObjectPool = [];
        }
        FileHandle.prototype.getStreamObject = function () {
            if(this._streamObjectPool.length > 0) {
                return this._streamObjectPool.pop();
            } else {
                return new ActiveXObject("ADODB.Stream");
            }
        };
        FileHandle.prototype.releaseStreamObject = function (obj) {
            this._streamObjectPool.push(obj);
        };
        FileHandle.prototype.readFile = function (file) {
            try  {
                var streamObj = this.getStreamObject();
                streamObj.Open();
                streamObj.Type = 2;
                streamObj.Charset = 'x-ansi';
                streamObj.LoadFromFile(file);
                var bomChar = streamObj.ReadText(2);
                streamObj.Position = 0;
                if((bomChar.charCodeAt(0) == 0xFE && bomChar.charCodeAt(1) == 0xFF) || (bomChar.charCodeAt(0) == 0xFF && bomChar.charCodeAt(1) == 0xFE)) {
                    streamObj.Charset = 'unicode';
                } else if(bomChar.charCodeAt(0) == 0xEF && bomChar.charCodeAt(1) == 0xBB) {
                    streamObj.Charset = 'utf-8';
                }
                var str = streamObj.ReadText(-1);
                streamObj.Close();
                this.releaseStreamObject(streamObj);
                return str;
            } catch (err) {
                throw new Error("Error reading file \"" + file + "\": " + err.message);
            }
        };
        FileHandle.prototype.createFile = function (path, useUTF8) {
            try  {
                var streamObj = this.getStreamObject();
                streamObj.Charset = useUTF8 ? 'utf-8' : 'x-ansi';
                streamObj.Open();
                return new FileStreamWriter(streamObj, path, this._streamObjectPool);
            } catch (ex) {
                WScript.StdErr.WriteLine("Couldn't write to file '" + path + "'");
                throw ex;
            }
        };
        FileHandle.prototype.deleteFile = function (path) {
            if(this._fso.FileExists(path)) {
                this._fso.DeleteFile(path, true);
            }
        };
        FileHandle.prototype.fileExists = function (path) {
            return this._fso.FileExists(path);
        };
        return FileHandle;
    })();
    Wsh.FileHandle = FileHandle;    
})(Wsh || (Wsh = {}));
var System;
(function (System) {
    (function (IO) {
        var FileManager = (function () {
            function FileManager() { }
            FileManager.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    FileManager.handle = new NodeJs.FileHandle();
                } else if(System.Environment.isWsh()) {
                    FileManager.handle = new Wsh.FileHandle();
                } else {
                    throw new Error('Invalid host');
                }
            };
            return FileManager;
        })();
        IO.FileManager = FileManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;
})(System || (System = {}));
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var WebRequest = (function () {
        function WebRequest() {
            this._request = require('request');
        }
        WebRequest.prototype.getUrl = function (url, callback) {
            System.Console.writeLine("tsd \033[32mhttp \033[35mGET\033[0m " + url);
            this._request(url, function (error, response, body) {
                if(error) {
                    System.Console.writeLine("tsd \033[31mERR!\033[0m \033[35mGET\033[0m Please, check your internet connection - " + error + '\n');
                } else {
                    System.Console.writeLine("tsd \033[32mhttp \033[35m" + response.statusCode + "\033[0m " + url);
                    if(response.statusCode == 404) {
                        System.Console.writeLine("tsd \033[31mERR!\033[0m " + response.statusCode + " Not Found");
                    } else if(!error && response.statusCode == 200) {
                        callback(body);
                    } else {
                        System.Console.writeLine("tsd \033[31ERR!\033[0m " + response.statusCode + " " + error);
                    }
                }
            });
        };
        return WebRequest;
    })();
    NodeJs.WebRequest = WebRequest;    
})(NodeJs || (NodeJs = {}));
var Wsh;
(function (Wsh) {
    var WebRequest = (function () {
        function WebRequest() { }
        WebRequest.prototype.request = function (url, callback) {
            var strResult;
            System.Console.writeLine("tsd http GET " + url);
            var WinHttpReq = new ActiveXObject("WinHttp.WinHttpRequest.5.1");
            try  {
                var temp = WinHttpReq.Open("GET", url, false);
                WinHttpReq.Send();
                System.Console.writeLine("tsd http " + WinHttpReq.statusCode + " " + url);
                strResult = WinHttpReq.ResponseText;
            } catch (objError) {
                System.Console.writeLine("tsd ERR! " + WinHttpReq.statusCode + " " + objError.message);
                strResult = objError + "\n";
                strResult += "WinHTTP returned error: " + (objError.number & 0xFFFF).toString() + "\n\n";
                strResult += objError.description;
            }
            return callback(strResult);
        };
        WebRequest.prototype.getUrl = function (url, callback) {
            this.request(url, callback);
        };
        return WebRequest;
    })();
    Wsh.WebRequest = WebRequest;    
})(Wsh || (Wsh = {}));
var System;
(function (System) {
    (function (Web) {
        var WebHandler = (function () {
            function WebHandler() { }
            WebHandler.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    WebHandler.request = new NodeJs.WebRequest();
                } else if(System.Environment.isWsh()) {
                    WebHandler.request = new Wsh.WebRequest();
                } else {
                    throw new Error('Invalid host');
                }
            };
            return WebHandler;
        })();
        Web.WebHandler = WebHandler;        
    })(System.Web || (System.Web = {}));
    var Web = System.Web;
})(System || (System = {}));
var DataSource;
(function (DataSource) {
    var WebDataSource = (function () {
        function WebDataSource(repositoryUrl) {
            this.repositoryUrl = repositoryUrl;
        }
        WebDataSource.prototype.all = function (callback) {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, function (body) {
                if(System.Environment.isWsh()) {
                    callback(eval("(function(){return " + body + ";})()").repo);
                } else {
                    callback(JSON.parse(body).repo);
                }
            });
        };
        WebDataSource.prototype.find = function (keys) {
            return null;
        };
        WebDataSource.prototype.content = function (callback) {
            System.Web.WebHandler.request.getUrl(this.repositoryUrl, function (body) {
                callback(body);
            });
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
                    throw new Error("Error reading file repository file: " + err.message);
                }
                callback(JSON.parse(data).repo);
            });
        };
        FileSystemDataSource.prototype.find = function (keys) {
            return null;
        };
        FileSystemDataSource.prototype.content = function (callback) {
            callback(this._fs.readFileSync(this.repositoryPath, 'utf8'));
        };
        return FileSystemDataSource;
    })();
    DataSource.FileSystemDataSource = FileSystemDataSource;    
})(DataSource || (DataSource = {}));
var DataSource;
(function (DataSource) {
    var LibVersion = (function () {
        function LibVersion() { }
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
    var BaseCommand = (function () {
        function BaseCommand() { }
        BaseCommand.prototype.accept = function (args) {
            throw new Error("Not implemented exception");
        };
        BaseCommand.prototype.exec = function (args) {
            throw new Error("Not implemented exception");
        };
        BaseCommand.prototype.toString = function () {
            return format(2, 15, this.shortcut) + "   " + format(0, 57, this.usage);
        };
        return BaseCommand;
    })();
    Command.BaseCommand = BaseCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var Helper = (function () {
        function Helper() { }
        Helper.print = function print(lib, repoNumber) {
            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;
            System.Console.writeLine(format(1, 28, name) + ' ' + format(0, 7, version) + ' ' + format(0, 39, description) + ' ' + repoNumber.toString());
        };
        Helper.printLibs = function printLibs(libs, repo, repoNumber) {
            System.Console.writeLine('');
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + ']: ' + repo.source);
            System.Console.writeLine('');
            System.Console.writeLine(' Name                         Version Description                             R');
            System.Console.writeLine(' ---------------------------- ------- --------------------------------------- -');
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                Helper.print(lib, repoNumber);
            }
            System.Console.writeLine(' ------------------------------------------------------------------------------');
            System.Console.writeLine(' Repo [' + repoNumber + '] - Total: ' + libs.length + ' lib(s).');
            System.Console.writeLine('');
        };
        Helper.getDataSource = function getDataSource(uri) {
            return DataSource.DataSourceFactory.factory(uri);
        };
        Helper.getSourceContent = function getSourceContent(uri, callback) {
            Helper.getDataSource(uri).content(callback);
        };
        return Helper;
    })();
    Command.Helper = Helper;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var HelpCommand = (function (_super) {
        __extends(HelpCommand, _super);
        function HelpCommand() {
            _super.apply(this, arguments);

            this.shortcut = "-h";
            this.usage = "Print this help message";
        }
        HelpCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        HelpCommand.prototype.exec = function (args) {
        };
        return HelpCommand;
    })(Command.BaseCommand);
    Command.HelpCommand = HelpCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var AllCommand = (function (_super) {
        __extends(AllCommand, _super);
        function AllCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "all";
            this.usage = "Show all file definitions from repository";
            this._indexSync = 0;
        }
        AllCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        AllCommand.prototype.repoExplorer = function (dataSource, uriList) {
            var _this = this;
            dataSource.all(function (libs) {
                var repoNumber = _this._indexSync - 1;
                Command.Helper.printLibs(libs, uriList[repoNumber], repoNumber);
                if(_this._indexSync < uriList.length) {
                    _this.repoExplorer(Command.Helper.getDataSource(uriList[_this._indexSync++]), uriList);
                }
            });
        };
        AllCommand.prototype.exec = function (args) {
            var uriList = this.cfg.repo.uriList;
            if(this._indexSync < uriList.length) {
                this.repoExplorer(Command.Helper.getDataSource(uriList[this._indexSync++]), uriList);
            }
        };
        return AllCommand;
    })(Command.BaseCommand);
    Command.AllCommand = AllCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var SearchCommand = (function (_super) {
        __extends(SearchCommand, _super);
        function SearchCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "search";
            this.usage = "Search a file definition on repository";
            this._indexSync = 0;
        }
        SearchCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        SearchCommand.prototype.print = function (lib) {
            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;
            System.Console.writeLine(format(1, 28, name) + ' ' + format(0, 7, version) + ' ' + format(0, 41, description));
        };
        SearchCommand.prototype.match = function (key, name) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        };
        SearchCommand.prototype.verifyMatch = function (lib, args) {
            var found = false;
            for(var i = 3; i < args.length; i++) {
                var key = args[i];
                if(this.match(key, lib.name)) {
                    found = true;
                }
            }
            return found;
        };
        SearchCommand.prototype.showResults = function (dataSource, uriList, args) {
            var _this = this;
            dataSource.all(function (libs) {
                var repoNumber = _this._indexSync - 1;
                var foundLibs = [];
                for(var i = 0; i < libs.length; i++) {
                    var lib = libs[i];
                    if(_this.verifyMatch(lib, args)) {
                        foundLibs.push(lib);
                    }
                }
                if(foundLibs.length == 0) {
                    System.Console.writeLine("   [!] No results found.");
                } else {
                    Command.Helper.printLibs(foundLibs, uriList[repoNumber], repoNumber);
                }
                if(_this._indexSync < uriList.length) {
                    _this.showResults(Command.Helper.getDataSource(uriList[_this._indexSync++]), uriList, args);
                }
            });
        };
        SearchCommand.prototype.exec = function (args) {
            var uriList = this.cfg.repo.uriList;
            if(this._indexSync < uriList.length) {
                this.showResults(Command.Helper.getDataSource(uriList[this._indexSync++]), uriList, args);
            }
        };
        return SearchCommand;
    })(Command.BaseCommand);
    Command.SearchCommand = SearchCommand;    
})(Command || (Command = {}));
var System;
(function (System) {
    })(System || (System = {}));
var NodeJs;
(function (NodeJs) {
    var DirectoryHandle = (function () {
        function DirectoryHandle() {
            this._fs = require('fs');
            this._path = require('path');
        }
        DirectoryHandle.prototype.directoryExists = function (path) {
            return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
        };
        DirectoryHandle.prototype.createDirectory = function (path) {
            if(!this.directoryExists(path)) {
                path = path.replace('\\', '/');
                var parts = path.split('/');
                var dpath = '';
                for(var i = 0; i < parts.length; i++) {
                    dpath += parts[i] + '/';
                    if(!this.directoryExists(dpath)) {
                        this._fs.mkdirSync(dpath);
                    }
                }
            }
        };
        DirectoryHandle.prototype.dirName = function (path) {
            return this._path.dirname(path);
        };
        DirectoryHandle.prototype.getAllFiles = function (path, spec, options) {
            var _this = this;
            options = options || {
            };
            var filesInFolder = function (folder) {
                var paths = [];
                var files = _this._fs.readdirSync(folder);
                for(var i = 0; i < files.length; i++) {
                    var stat = _this._fs.statSync(folder + "/" + files[i]);
                    if(options.recursive && stat.isDirectory()) {
                        paths = paths.concat(filesInFolder(folder + "/" + files[i]));
                    } else if(stat.isFile() && (!spec || files[i].match(spec))) {
                        paths.push(folder + "/" + files[i]);
                    }
                }
                return paths;
            };
            return filesInFolder(path);
        };
        return DirectoryHandle;
    })();
    NodeJs.DirectoryHandle = DirectoryHandle;    
})(NodeJs || (NodeJs = {}));
var Wsh;
(function (Wsh) {
    
    var DirectoryHandle = (function () {
        function DirectoryHandle() {
            this._fso = new ActiveXObject("Scripting.FileSystemObject");
        }
        DirectoryHandle.prototype.directoryExists = function (path) {
            return this._fso.FolderExists(path);
        };
        DirectoryHandle.prototype.createDirectory = function (path) {
            if(!this.directoryExists(path)) {
                path = path.replace('\\', '/');
                var parts = path.split('/');
                var dpath = '';
                for(var i = 0; i < parts.length; i++) {
                    dpath += parts[i] + '/';
                    if(!this.directoryExists(dpath)) {
                        this._fso.CreateFolder(dpath);
                    }
                }
            }
        };
        DirectoryHandle.prototype.dirName = function (path) {
            return this._fso.GetParentFolderName(path);
        };
        DirectoryHandle.prototype.getAllFiles = function (path, spec, options) {
            options = options || {
            };
            function filesInFolder(folder, root) {
                var paths = [];
                var fc;
                if(options.recursive) {
                    fc = new Enumerator(folder.subfolders);
                    for(; !fc.atEnd(); fc.moveNext()) {
                        paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                    }
                }
                fc = new Enumerator(folder.files);
                for(; !fc.atEnd(); fc.moveNext()) {
                    if(!spec || fc.item().Name.match(spec)) {
                        paths.push(root + "\\" + fc.item().Name);
                    }
                }
                return paths;
            }
            var folder = this._fso.GetFolder(path);
            var paths = [];
            return filesInFolder(folder, path);
        };
        return DirectoryHandle;
    })();
    Wsh.DirectoryHandle = DirectoryHandle;    
})(Wsh || (Wsh = {}));
var System;
(function (System) {
    (function (IO) {
        var DirectoryManager = (function () {
            function DirectoryManager() { }
            DirectoryManager.initialize = function initialize() {
                if(System.Environment.isNode()) {
                    DirectoryManager.handle = new NodeJs.DirectoryHandle();
                } else if(System.Environment.isWsh()) {
                    DirectoryManager.handle = new Wsh.DirectoryHandle();
                } else {
                    throw new Error('Invalid host');
                }
            };
            return DirectoryManager;
        })();
        IO.DirectoryManager = DirectoryManager;        
    })(System.IO || (System.IO = {}));
    var IO = System.IO;
})(System || (System = {}));
var Uri = (function () {
    var options = {
        strictMode: false,
        key: [
            "source", 
            "protocol", 
            "authority", 
            "userInfo", 
            "user", 
            "password", 
            "host", 
            "port", 
            "relative", 
            "path", 
            "directory", 
            "file", 
            "query", 
            "anchor"
        ],
        q: {
            name: "queryKey",
            parser: /(?:^|&)([^&=]*)=?([^&]*)/g
        },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    };
    function parseUri(str) {
        var o = options, m = o.parser[o.strictMode ? "strict" : "loose"].exec(str), uri = {
        }, i = 14;
        while(i--) {
            uri[o.key[i]] = m[i] || "";
        }
        uri[o.q.name] = {
        };
        uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if($1) {
                uri[o.q.name][$1] = $2;
            }
        });
        return uri;
    }
    ;
    return {
        parseUri: parseUri
    };
})();
var Command;
(function (Command) {
    var InstallCommand = (function (_super) {
        __extends(InstallCommand, _super);
        function InstallCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "install";
            this.usage = "Intall file definition. Use install* to map dependencies.";
            this._cache = [];
            this._index = 0;
            this._withDep = false;
            this._withRepoIndex = false;
        }
        InstallCommand.prototype.accept = function (args) {
            return (args[2] == this.shortcut || args[2] == this.shortcut + '*');
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
        InstallCommand.prototype.saveFile = function (name, content) {
            var sw = System.IO.FileManager.handle.createFile(name);
            sw.write(content);
            sw.flush();
            sw.close();
        };
        InstallCommand.prototype.normalizeGithubUrl = function (uri) {
            if(uri.host == 'github.com') {
                var parts = uri.directory.split('/');
                var repo = parts[2];
                var ignore = '/' + parts[1] + '/' + parts[2] + '/' + parts[3] + '/' + parts[4];
                uri.directory = '/' + repo + uri.directory.substr(ignore.length);
            }
        };
        InstallCommand.prototype.save = function (url, name, version, key, content, tsdUri, repo) {
            var uri = Uri.parseUri(url);
            this.normalizeGithubUrl(uri);
            var path = '';
            if(tsdUri.relative) {
                path = this.cfg.typingsPath + '/' + tsdUri.relative + '/';
            } else {
                path = this.cfg.typingsPath + uri.directory;
            }
            if(!System.IO.DirectoryManager.handle.directoryExists(path)) {
                System.IO.DirectoryManager.handle.createDirectory(path);
            }
            this.saveFile(path + name + ".d.ts", content);
            System.Console.writeLine("+-- " + name + "@" + version + " -> " + path);
            System.Console.writeLine("");
            if(repo) {
                this.cfg.addDependency(name, version, key, tsdUri, repo);
                this.cfg.save();
            }
        };
        InstallCommand.prototype.saveLib = function (tsdUri) {
            var _this = this;
            var uri = Uri.parseUri(tsdUri.source);
            this.normalizeGithubUrl(uri);
            var path = '';
            if(tsdUri.relative) {
                path = this.cfg.libPath + '/' + tsdUri.relative + '/';
            } else {
                path = this.cfg.libPath + uri.directory;
            }
            if(tsdUri.pre) {
                path = path + uri.directory.substr(tsdUri.pre.length);
            }
            if(!System.IO.DirectoryManager.handle.directoryExists(path)) {
                System.IO.DirectoryManager.handle.createDirectory(path);
            }
            var name = uri.file;
            Command.Helper.getSourceContent(tsdUri, function (body) {
                _this.saveFile(path + '/' + name, body);
                System.Console.writeLine("+-- " + name + " -> " + path + name + '\n');
            });
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
        InstallCommand.prototype.getVersion = function (versions, strVersion) {
            for(var i = 0; i < versions.length; i++) {
                var version = versions[i];
                if(version.version == strVersion) {
                    return version;
                }
            }
            return versions[0];
        };
        InstallCommand.prototype.install = function (targetLib, targetVersion, libs, repo) {
            var _this = this;
            if(this.cacheContains(targetLib.name)) {
                return;
            }
            if(targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = this.getVersion(targetLib.versions, targetVersion);
                Command.Helper.getSourceContent(version.uri, function (body) {
                    _this.save(version.uri.source, targetLib.name, version.version, version.key, body, version.uri, repo);
                    _this._cache.push(targetLib.name);
                    if(_this._isFull) {
                        var lib = (version.lib || {
                        });
                        if(lib.sources) {
                            for(var i = 0; i < lib.sources.length; i++) {
                                var source = lib.sources[i];
                                _this.saveLib(source.uri);
                            }
                        }
                    }
                    if(_this._withDep) {
                        var deps = (version.dependencies) || [];
                        for(var i = 0; i < deps.length; i++) {
                            var dep = _this.find(deps[i].name, libs);
                            _this.install(dep, dep.versions[0].version, libs, _this.cfg.repo.uriList[0]);
                        }
                    }
                });
            }
        };
        InstallCommand.prototype.execInternal = function (index, uriList, args) {
            var _this = this;
            var targetLib;
            var tryInstall = function (libs, lib) {
                targetLib = _this.find(lib.split('@')[0], libs);
                if(targetLib) {
                    var name = lib.split('@')[0];
                    var version = lib.split('@')[1];
                    _this.install(targetLib, version || targetLib.versions[0].version, libs, uriList[index]);
                } else {
                    System.Console.writeLine("   [!] Lib not found.\n");
                }
            };
            var dataSource = Command.Helper.getDataSource(uriList[index]);
            dataSource.all(function (libs) {
                var index = (_this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                while(lib) {
                    tryInstall(libs, lib);
                    index++;
                    lib = args[index];
                }
            });
        };
        InstallCommand.prototype.installFromConfig = function () {
            var libs = [];
            for(var dep in this.cfg.dependencies) {
                var name = dep.split('@')[0];
                var version = dep.split('@')[1];
                var key = this.cfg.dependencies[dep].key;
                var uri = this.cfg.dependencies[dep].uri;
                var lib = new DataSource.Lib();
                lib.name = name;
                lib.versions.push({
                    version: version,
                    key: key,
                    dependencies: [],
                    uri: uri,
                    lib: []
                });
                libs.push(lib);
            }
            for(var i = 0; i < libs.length; i++) {
                this.install(libs[i], libs[i].versions[0].version, [], null);
            }
        };
        InstallCommand.prototype.exec = function (args) {
            if(args[2].indexOf('*') != -1) {
                this._withDep = true;
            }
            if(!args[3]) {
                this.installFromConfig();
            } else {
                if(args[args.length - 1] == 'full') {
                    this._isFull = true;
                    args.pop();
                }
                var uriList = this.cfg.repo.uriList;
                if(args[3].indexOf('!') != -1) {
                    this._withRepoIndex = true;
                    var index = parseInt(args[3][1]);
                    if(index.toString() != "NaN") {
                        this.execInternal(index, uriList, args);
                    } else {
                        System.Console.writeLine("   [!] Invalid repository index.\n");
                    }
                } else {
                    this.execInternal(0, uriList, args);
                }
            }
        };
        return InstallCommand;
    })(Command.BaseCommand);
    Command.InstallCommand = InstallCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var Lib = (function () {
        function Lib() { }
        return Lib;
    })();    
    var UpdateCommand = (function (_super) {
        __extends(UpdateCommand, _super);
        function UpdateCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "update";
            this.usage = "Checks if any definition file needs to be updated";
            this._index = 0;
            this._libList = [];
        }
        UpdateCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        UpdateCommand.prototype.getVersion = function (libs, name, strVersion) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(lib.name == name) {
                    for(var j = 0; j < lib.versions.length; j++) {
                        var version = lib.versions[j];
                        if(version.version == strVersion) {
                            return version;
                        }
                    }
                    return lib.versions[0];
                }
            }
            return null;
        };
        UpdateCommand.prototype.update = function (lib) {
            var _this = this;
            var ds = Command.Helper.getDataSource(this.cfg.dependencies[lib].repo);
            ds.all(function (data) {
                var name = lib.split('@')[0];
                var version = lib.split('@')[1];
                var ver = _this.getVersion(data, name, version);
                if(ver) {
                    if(ver.key != _this.cfg.dependencies[lib].key) {
                        System.Console.writeLine(format(1, 34, lib) + format(1, 35, '  Update is available!'));
                    } else {
                        System.Console.writeLine(format(1, 34, lib) + format(1, 35, '  Is the latest version.'));
                    }
                }
                if(_this._index < _this._libList.length) {
                    _this.update(_this._libList[(_this._index++)]);
                } else {
                    System.Console.writeLine('\n');
                }
            });
        };
        UpdateCommand.prototype.exec = function (args) {
            System.Console.writeLine(' Lib                                  Status');
            System.Console.writeLine(' ------------------------------------ ----------------------------------------');
            for(var lib in this.cfg.dependencies) {
                this._libList.push(lib);
            }
            this.update(this._libList[(this._index++)]);
        };
        return UpdateCommand;
    })(Command.BaseCommand);
    Command.UpdateCommand = UpdateCommand;    
})(Command || (Command = {}));
var SourceTypeEnum;
(function (SourceTypeEnum) {
    SourceTypeEnum._map = [];
    SourceTypeEnum._map[0] = "FileSystem";
    SourceTypeEnum.FileSystem = 0;
    SourceTypeEnum._map[1] = "Web";
    SourceTypeEnum.Web = 1;
})(SourceTypeEnum || (SourceTypeEnum = {}));
var TsdUri = (function () {
    function TsdUri() { }
    return TsdUri;
})();
var Repo = (function () {
    function Repo() {
        this.uriList = [];
    }
    return Repo;
})();
var Config = (function () {
    function Config() {
        this.version = "2.0";
        this.dependencies = {
        };
    }
    Config.FILE_NAME = 'tsd-config.json';
    Config.isNull = function isNull(cfg, key, alternativeValue) {
        return cfg[key] ? cfg[key] : alternativeValue;
    };
    Config.tryGetConfigFile = function tryGetConfigFile() {
        var cfg = {
        };
        try  {
            cfg = JSON.parse(System.IO.FileManager.handle.readFile(Config.FILE_NAME));
        } catch (e) {
        }
        return cfg;
    };
    Config.prototype.load = function () {
        var cfg = Config.tryGetConfigFile();
        this.typingsPath = Config.isNull(cfg, 'typingsPath', 'typings');
        this.libPath = Config.isNull(cfg, 'libPath', 'lib');
        this.dependencies = Config.isNull(cfg, 'dependencies', []);
        this.repo = Config.isNull(cfg, 'repo', {
            uriList: [
                {
                    sourceType: SourceTypeEnum.Web,
                    source: "http://www.tsdpm.com/repository_v2.json"
                }
            ]
        });
    };
    Config.prototype.save = function () {
        var dep = {
        };
        for(var attr in this.dependencies) {
            dep[attr] = this.dependencies[attr];
        }
        var cfg = {
            localPath: this.typingsPath,
            libPath: this.libPath,
            repo: this.repo,
            dependencies: dep
        };
        var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
        sw.write(JSON.stringify(cfg, null, 4));
        sw.flush();
        sw.close();
    };
    Config.prototype.addDependency = function (name, version, key, uri, repo) {
        this.dependencies[name + '@' + version] = {
            repo: repo,
            key: key,
            uri: uri
        };
    };
    return Config;
})();
var Command;
(function (Command) {
    var CreateLocalConfigCommand = (function (_super) {
        __extends(CreateLocalConfigCommand, _super);
        function CreateLocalConfigCommand() {
            _super.apply(this, arguments);

            this.shortcut = "ncfg";
            this.usage = "Create a local config file";
        }
        CreateLocalConfigCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        CreateLocalConfigCommand.prototype.saveConfigFile = function () {
            var sw = System.IO.FileManager.handle.createFile(Config.FILE_NAME);
            sw.write('{\n' + '    "version": "v2",\n' + '    "typingsPath": "typings",\n' + '    "libPath": "lib",\n' + '    "repo": {\n' + '        "uriList": [{\n' + '                "sourceType": "1",\n' + '                "source": "http://www.tsdpm.com/repository_v2.json"\n' + '            }\n' + '        ]\n' + '    },\n' + '    "dependencies": {}\n' + '}');
            sw.flush();
            sw.close();
        };
        CreateLocalConfigCommand.prototype.exec = function (args) {
            if(System.IO.FileManager.handle.fileExists(Config.FILE_NAME)) {
                throw new Error("   [!] There is already a configuration file in this folder.");
            } else {
                this.saveConfigFile();
            }
            System.Console.writeLine("   [!] Configuration file created successfully.");
            System.Console.writeLine("");
        };
        return CreateLocalConfigCommand;
    })(Command.BaseCommand);
    Command.CreateLocalConfigCommand = CreateLocalConfigCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var InfoCommand = (function (_super) {
        __extends(InfoCommand, _super);
        function InfoCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "info";
            this.usage = "Get lib information";
            this._index = 0;
            this._withRepoIndex = false;
        }
        InfoCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut && args[3];
        };
        InfoCommand.prototype.match = function (key, name) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        };
        InfoCommand.prototype.find = function (key, libs) {
            for(var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if(this.match(lib.name, key)) {
                    return lib;
                }
            }
            return null;
        };
        InfoCommand.prototype.display = function (targetLib, targetVersion, libs) {
            if(targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = targetLib.versions[0];
                System.Console.writeLine("         name: " + targetLib.name);
                System.Console.writeLine("  description: " + format(0, 60, targetLib.description));
                System.Console.writeLine("          key: " + version.key);
                System.Console.writeLine("      version: " + version.version);
                System.Console.writeLine("       author: " + format(0, 60, version.author.name + ' (' + version.author.url + ')'));
                System.Console.writeLine("          url: " + format(0, 60, version.uri.source));
                System.Console.writeLine("");
            }
        };
        InfoCommand.prototype.execInternal = function (index, uriList, args) {
            var _this = this;
            var targetLib;
            var tryGetInfo = function (libs, lib) {
                targetLib = _this.find(lib, libs);
                if(targetLib) {
                    _this.display(targetLib, targetLib.versions[0].version, libs);
                } else {
                    System.Console.writeLine("   [!] Lib not found.\n");
                }
            };
            var dataSource = Command.Helper.getDataSource(uriList[index]);
            dataSource.all(function (libs) {
                var index = (_this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                tryGetInfo(libs, lib);
            });
        };
        InfoCommand.prototype.exec = function (args) {
            var uriList = this.cfg.repo.uriList;
            if(args[3].indexOf('!') != -1) {
                this._withRepoIndex = true;
                var index = parseInt(args[3][1]);
                if(index.toString() != "NaN") {
                    this.execInternal(index, uriList, args);
                } else {
                    System.Console.writeLine("   [!] Invalid repository index.\n");
                }
            } else {
                this.execInternal(0, uriList, args);
            }
        };
        return InfoCommand;
    })(Command.BaseCommand);
    Command.InfoCommand = InfoCommand;    
})(Command || (Command = {}));
var Command;
(function (Command) {
    var RepoCommand = (function (_super) {
        __extends(RepoCommand, _super);
        function RepoCommand(cfg) {
                _super.call(this);
            this.cfg = cfg;
            this.shortcut = "repo";
            this.usage = "Show repo list";
            this._index = 0;
            this._withRepoIndex = false;
        }
        RepoCommand.prototype.accept = function (args) {
            return args[2] == this.shortcut;
        };
        RepoCommand.prototype.exec = function (args) {
            var uriList = this.cfg.repo.uriList;
            if(uriList.length > 0) {
                var index = 0;
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' REPOSITORY LIST ');
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                for(var i = 0; i < uriList.length; i++) {
                    System.Console.writeLine(' [' + (index++) + '] ' + uriList[i].source);
                }
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' Total: ' + uriList.length + ' repositories.\n');
            }
        };
        return RepoCommand;
    })(Command.BaseCommand);
    Command.RepoCommand = RepoCommand;    
})(Command || (Command = {}));
var CommandLineProcessor = (function () {
    function CommandLineProcessor(cfg) {
        this.cfg = cfg;
        this.commands = [];
        this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(cfg));
        this.commands.push(new Command.SearchCommand(cfg));
        this.commands.push(new Command.InstallCommand(cfg));
        this.commands.push(new Command.UpdateCommand(this.cfg));
        this.commands.push(new Command.CreateLocalConfigCommand());
        this.commands.push(new Command.InfoCommand(cfg));
        this.commands.push(new Command.RepoCommand(cfg));
    }
    CommandLineProcessor.prototype.printUsage = function () {
        System.Console.out.autoFlush = false;
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('The following TSD commands are included:');
        System.Console.writeLine('');
        System.Console.writeLine("  Command           Description");
        System.Console.writeLine("  ----------------  ---------------------------------------------------------");
        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine(this.commands[i].toString());
        }
        System.Console.writeLine('');
        System.Console.out.flush();
    };
    CommandLineProcessor.prototype.execute = function (args) {
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
        DataSourceFactory.factory = function factory(uri) {
            if(uri.sourceType == SourceTypeEnum.FileSystem) {
                return new DataSource.FileSystemDataSource(uri.source);
            } else if(uri.sourceType == SourceTypeEnum.Web) {
                return new DataSource.WebDataSource(uri.source);
            } else {
                throw Error('Invalid dataSource.');
            }
        };
        return DataSourceFactory;
    })();
    DataSource.DataSourceFactory = DataSourceFactory;    
})(DataSource || (DataSource = {}));
function complete(val) {
    var result = '';
    for(var i = 0; i < val; i++) {
        result += ' ';
    }
    return result;
}
function format(start, maxLen, text) {
    return complete(start) + (text.length > maxLen ? text.substr(0, maxLen - 3) + '...' : text + complete(maxLen - text.length));
}
var Main = (function () {
    function Main() { }
    Main.prototype.init = function () {
        System.Console.initialize();
        System.IO.FileManager.initialize();
        System.IO.DirectoryManager.initialize();
        System.Web.WebHandler.initialize();
    };
    Main.prototype.run = function (args) {
        try  {
            var cfg = new Config();
            cfg.load();
            var cp = new CommandLineProcessor(cfg);
            cp.execute(args);
        } catch (e) {
            System.Console.writeLine(e.message);
            System.Console.writeLine("");
        }
    };
    return Main;
})();
var main = new Main();
main.init();
var arguments;
if(System.Environment.isNode()) {
    arguments = Array.prototype.slice.call(process.argv);
}
if(System.Environment.isWsh()) {
    var args = [
        null, 
        null
    ];
    for(var i = 0; i < WScript.Arguments.length; i++) {
        args[2 + i] = WScript.Arguments.Item(i);
    }
    arguments = args;
}
main.run(arguments);
