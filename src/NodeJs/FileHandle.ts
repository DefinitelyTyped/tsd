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

        public close(): void {
            //...
        }
    }

    export class FileHandle implements System.IO.IFileHandle {
        private _fs = require('fs');

        public readFile(file): string {
            var buffer = this._fs.readFileSync(file);
            switch (buffer[0]) {
                case 0xFE:
                    if (buffer[1] == 0xFF) {
                        // utf16-be. Reading the buffer as big endian is not supported, so convert it to 
                        // Little Endian first
                        var i = 0;
                        while ((i + 1) < buffer.length) {
                            var temp = buffer[i]
                            buffer[i] = buffer[i + 1];
                            buffer[i + 1] = temp;
                            i += 2;
                        }
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xFF:
                    if (buffer[1] == 0xFE) {
                        // utf16-le 
                        return buffer.toString("ucs2", 2);
                    }
                    break;
                case 0xEF:
                    if (buffer[1] == 0xBB) {
                        // utf-8
                        return buffer.toString("utf8", 3);
                    }
            }
            // Default behaviour
            return buffer.toString();
        }

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