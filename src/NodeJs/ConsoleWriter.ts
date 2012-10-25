///<reference path='../d.ts/node-0.8.d.ts'/>
///<reference path='../System/IO/StreamWriter.ts'/>

module NodeJs { 
    export class ConsoleWriter extends System.IO.StreamWriter { 

        public flush(): void {
            process.stdout.write(this._buffer);
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