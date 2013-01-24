///<reference path='../System/IO/IDirectoryHandle.ts'/>

module Wsh {
    // Declare dependencies needed for all supported hosts
    declare class Enumerator {
        public atEnd(): bool;
        public moveNext();
        public item(): any;
        constructor (o: any);
    }

    export class DirectoryHandle implements System.IO.IDirectoryHandle{
        private _fso = new ActiveXObject("Scripting.FileSystemObject");

        public directoryExists(path: string): bool { 
            return <bool>this._fso.FolderExists(path);
        }

        public createDirectory(path: string): void { 
            if (!this.directoryExists(path)) {

                path = path.replace('\\', '/');
                var parts = path.split('/');

                var dpath = '';
                for (var i = 0; i < parts.length; i++) { 
                    dpath += parts[i] + '/';
                    if (!this.directoryExists(dpath)) {
                        this._fso.CreateFolder(dpath);
                    }
                }
            }
        }

        public dirName(path: string): string { 
            return this._fso.GetParentFolderName(path);
        }

        public getAllFiles(path, spec? , options? ): string[] {
                options = options || <{ recursive?: bool; }>{};
                function filesInFolder(folder, root): string[]{
                    var paths = [];
                    var fc: Enumerator;

                    if (options.recursive) {
                        fc = new Enumerator(folder.subfolders);

                        for (; !fc.atEnd() ; fc.moveNext()) {
                            paths = paths.concat(filesInFolder(fc.item(), root + "\\" + fc.item().Name));
                        }
                    }

                    fc = new Enumerator(folder.files);

                    for (; !fc.atEnd() ; fc.moveNext()) {
                        if (!spec || fc.item().Name.match(spec)) {
                            paths.push(root + "\\" + fc.item().Name);
                        }
                    }

                    return paths;
                }

                var folder = this._fso.GetFolder(path);
                var paths = [];

                return filesInFolder(folder, path);
        }
    }
}