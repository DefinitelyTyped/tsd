///<reference path='../System/IO/StreamWriter.ts'/>

module Wsh { 
    export class ConsoleWriter extends System.IO.StreamWriter { 

        public flush(): void {
            WScript.StdOut.Write(this._buffer);
        }

        public flushAsync(callback: () => void ): void {
            this.flush();
            callback();
        }

        public dispose(): void { 
            throw new Error("Not Implemented Exception");
        }
    }
}