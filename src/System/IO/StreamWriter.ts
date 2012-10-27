///<reference path='ITextWriter.ts'/>

module System.IO {
    export class StreamWriter implements ITextWriter {

        public _buffer: string;

        public autoFlush: bool = true;

        public flush(): void {
            throw new Error("Not Implemented Exception");
        }

        public flushAsync(callback: () => void ): void {
            throw new Error("Not Implemented Exception");
        }

        public write(value: string): void { 
            if (!this._buffer) { 
                this._buffer = '';
            }
            this._buffer += value;

            if (this.autoFlush) { 
                this.flush();
                this._buffer = null;
            }
        }

        public writeLine(value: string): void { 
            this.write(value + '\n');
        }

        public writeAsync(value: string, callback: () => void): void { 
            if (!this._buffer) { 
                this._buffer = '';
            }
            this._buffer += value;
            if (this.autoFlush) { 
                this.flushAsync(() => { this._buffer = null; callback(); });
            }
        } 

        writeLineAsync(value: string, callback: () => void): void { 
            this.writeAsync(value + '\n', callback);
        }

        public dispose(): void { 
            throw new Error("Not Implemented Exception");
        }

        public close(): void {
            throw new Error("Not Implemented Exception");
        }
    }
}