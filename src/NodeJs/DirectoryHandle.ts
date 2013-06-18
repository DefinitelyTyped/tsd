///<reference path='../System/IO/IDirectoryHandle.ts'/>

module NodeJs {
    export class DirectoryHandle implements System.IO.IDirectoryHandle {
        private _fs = require('fs');
        private  _path = require('path');

        public directoryExists(path:string):bool{
            return this._fs.existsSync(path) && this._fs.lstatSync(path).isDirectory();
        }

        public createDirectory(path:string):void{
            if (!this.directoryExists(path)) {

                var parts = this._path.normalize(path).split(/[\\\/]/g);
                var dpath = '';
                for (var i = 0; i < parts.length; i++) {
                    if (parts[i].length === 0) {
                        continue;
                    }
                    dpath += parts[i] + this._path.sep;
                    if (!this.directoryExists(dpath)) {
                        this._fs.mkdirSync(dpath);
                    }
                }
            }
        }

        public dirName(path:string):string{
            return this._path.dirname(path);
        }

        public getAllFiles(path, spec?, options?):string[]{
            options = options || <{ recursive?: bool; }>{};

            var filesInFolder = (folder:string):string[] =>{
                var paths = [];

                var files = this._fs.readdirSync(folder);
                for (var i = 0; i < files.length; i++) {
                    var p = this._path.join(folder, files[i]);
                    var stat = this._fs.statSync(p);
                    if (options.recursive && stat.isDirectory()) {
                        paths = paths.concat(filesInFolder(p));
                    } else if (stat.isFile() && (!spec || files[i].match(spec))) {
                        paths.push(p);
                    }
                }

                return paths;
            }

            return filesInFolder(path);
        }
    }
}