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
    }
}