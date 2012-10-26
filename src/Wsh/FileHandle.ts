///<reference path='../System/IO/IFileHandle.ts'/>
///<reference path='../System/IO/StreamWriter.ts'/>

module Wsh { 
    export class FileHandle implements System.IO.IFileHandle {

        public createFile(path: string): System.IO.StreamWriter {
            return null;
        }

        public deleteFile(path): void {
        }

        public fileExists(path): bool{ 
            return false;
        }
    }
}