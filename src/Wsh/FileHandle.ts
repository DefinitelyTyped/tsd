///<reference path='../System/IO/IFileHandle.ts'/>
///<reference path='../System/IO/StreamWriter.ts'/>

module Wsh { 

    class FileStreamWriter extends System.IO.StreamWriter { 
        private _streamObjectPool: any;
        public autoFlush: bool = false;

        constructor(public streamObj: any, public path: string, streamObjectPool) { 
            super();
            this._streamObjectPool = streamObjectPool;
        }

        private releaseStreamObject(obj: any) { 
            this._streamObjectPool.push(obj);
        }

        public flush(): void {
            this.streamObj.WriteText(this._buffer, 0);
        }

        public flushAsync(callback: () => void ): void {
            this.streamObj.WriteText(this._buffer, 0);
            callback();
        }

        public close(): void {
            this.streamObj.SaveToFile(this.path, 2);
            this.streamObj.Close();
            this.releaseStreamObject(this.streamObj);
        }
    }

    export class FileHandle implements System.IO.IFileHandle {
        private _fso = new ActiveXObject("Scripting.FileSystemObject");
        private _streamObjectPool = [];

        private getStreamObject(): any { 
            if (this._streamObjectPool.length > 0) {
                return this._streamObjectPool.pop();
            }  else {
                return new ActiveXObject("ADODB.Stream");
            }
        }

        private releaseStreamObject(obj: any) { 
            this._streamObjectPool.push(obj);
        }

        public readFile(file): string {
            try {
                var streamObj = this.getStreamObject();
                streamObj.Open();
                streamObj.Type = 2; // Text data
                streamObj.Charset = 'x-ansi'; // Assume we are reading ansi text
                streamObj.LoadFromFile(file);
                var bomChar = streamObj.ReadText(2); // Read the BOM char
                streamObj.Position = 0; // Position has to be at 0 before changing the encoding
                if ((bomChar.charCodeAt(0) == 0xFE && bomChar.charCodeAt(1) == 0xFF)
                    || (bomChar.charCodeAt(0) == 0xFF && bomChar.charCodeAt(1) == 0xFE)) {
                    streamObj.Charset = 'unicode';
                } else if (bomChar.charCodeAt(0) == 0xEF && bomChar.charCodeAt(1) == 0xBB) {                    streamObj.Charset = 'utf-8';                 }
                // Read the whole file
                var str = streamObj.ReadText(-1 /* read from the current position to EOS */);
                streamObj.Close();
                this.releaseStreamObject(streamObj);
                return <string>str;
            }
            catch (err) {
                throw new Error("Error reading file \"" + file + "\": " + err.message);
            }
        }

        public createFile(path: string, useUTF8?): System.IO.StreamWriter {
            try {
                var streamObj = this.getStreamObject();
                streamObj.Charset = useUTF8 ? 'utf-8' : 'x-ansi';
                streamObj.Open();
                return new FileStreamWriter(streamObj, path, this._streamObjectPool);
            } catch (ex) {
                WScript.StdErr.WriteLine("Couldn't write to file '" + path + "'");
                throw ex;
            }
        }

        public deleteFile(path): void {
            if (this._fso.FileExists(path)) {
                this._fso.DeleteFile(path, true); // true: delete read-only files
            }
        }

        public fileExists(path): bool{ 
            return this._fso.FileExists(path);
        }
    }
}