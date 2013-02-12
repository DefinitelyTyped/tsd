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
var System;
(function (System) {
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
                case 254:
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
                case 255:
                    if(buffer[1] == 254) {
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 239:
                    if(buffer[1] == 187) {
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
function GUID() {
    var S4 = function () {
        return Math.floor(Math.random() * 65536).toString(16);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
;
var files = new NodeJs.DirectoryHandle().getAllFiles('../repo_data');
var repo = [];
var repo_v2 = [];
var repo_site = [];
for(var i = 0; i < files.length; i++) {
    console.log(files[i]);
    var content = new NodeJs.FileHandle().readFile(files[i]);
    var obj = JSON.parse(content);
    repo.push(obj);
    repo_site.push({
        name: obj.name,
        description: obj.description,
        key: obj.versions[0].key,
        dependencies: obj.versions[0].dependencies,
        version: obj.versions[0].version,
        author: obj.versions[0].author,
        author_url: obj.versions[0].author_url,
        url: obj.versions[0].url
    });
    repo_v2.push({
        name: obj.name,
        description: obj.description,
        versions: [
            {
                version: obj.versions[0].version,
                key: obj.versions[0].key,
                dependencies: obj.versions[0].dependencies,
                url: {
                    source: obj.versions[0].url,
                    sourceType: 1
                },
                author: {
                    name: obj.versions[0].author,
                    url: obj.versions[0].author_url
                },
                lib: {
                    sources: []
                }
            }
        ]
    });
}
var sw = new NodeJs.FileHandle().createFile('../deploy/repository.json');
sw.write(JSON.stringify(repo));
sw.flush();
sw.close();
var sw2 = new NodeJs.FileHandle().createFile('../../tsdpm-site/tmpl/repository.js');
sw2.write('var __repo = ' + JSON.stringify(repo_site) + ';');
sw2.flush();
sw2.close();
var sw3 = new NodeJs.FileHandle().createFile('../deploy/repository_v2.json');
sw3.write(JSON.stringify({
    repo: repo_v2
}));
sw3.flush();
sw3.close();
