///<reference path='../System/IO/IDirectoryHandle.ts'/>

module Wsh {
    export class DirectoryHandle implements System.IO.IDirectoryHandle{
        private _fso = new ActiveXObject("Scripting.FileSystemObject");

        public directoryExists(path: string): bool { 
            return <bool>this._fso.FolderExists(path);
        }

        public createDirectory(path: string): void { 
            if (!this.directoryExists(path)) {
                this._fso.CreateFolder(path);
            }
        }

        public dirName(path: string): string { 
            return this._fso.GetParentFolderName(path);
        }
    }
}