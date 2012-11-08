///<reference path='../System/IO/IDirectoryHandle.ts'/>

module NodeJs {
    export class DirectoryHandle implements System.IO.IDirectoryHandle{
        private _fs = require('fs');
        private  _path = require('path');

        public directoryExists(path: string): bool { 
            return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
        }

        public createDirectory(path: string): void { 
            if (!this.directoryExists(path)) {
                this._fs.mkdirSync(path);
            }
        }

        public dirName(path: string): string { 
            return this._path.dirname(path);
        }

        public getAllFiles(path, spec?, options?): string[] { 
            options = options || <{ recursive?: bool; }>{};

            var filesInFolder = (folder: string): string[] => {
                var paths = [];

                var files = this._fs.readdirSync(folder);
                for (var i = 0; i < files.length; i++) {
                    var stat = this._fs.statSync(folder + "/" + files[i]);
                    if (options.recursive && stat.isDirectory()) {
                        paths = paths.concat(filesInFolder(folder + "/" + files[i]));
                    } else if (stat.isFile() && (!spec || files[i].match(spec))) {
                        paths.push(folder + "/" + files[i]);
                    }
                }

                return paths;
            }

            return filesInFolder(path);
        }
    }
}