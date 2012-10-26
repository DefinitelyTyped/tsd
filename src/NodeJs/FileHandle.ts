///<reference path='../System/IO/IFileHandle.ts'/>
///<reference path='../System/IO/StreamWriter.ts'/>

module NodeJs { 

    class FileStreamWriter extends System.IO.StreamWriter { 
        private _fs = require('fs');
        public autoFlush: bool = false;

        constructor(public path: string) { 
            super();
        }

        public flush(): void {
            this._fs.appendFileSync(this.path, this._buffer);
        }

        public flushAsync(callback: () => void ): void {
            this._fs.writeFile(this.path, this._buffer, function (err) {
              if (err) throw err;
              callback();
            });
        }
    }

    export class FileHandle implements System.IO.IFileHandle {
        private _fs = require('fs');

        public createFile(path: string): System.IO.StreamWriter {
            this._fs.writeFileSync(path, '');
            return new FileStreamWriter(path);
        }

        public deleteFile(path): void {
            try {
                this._fs.unlinkSync(path);
            } catch (e) {
            }
        }

        public fileExists(path): bool{ 
            return this._fs.existsSync(path);
        }
    }
}