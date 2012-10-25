///<reference path='../IDisposable.ts'/>

module System.IO {
    export interface ITextWriter extends IDisposable {
        flush(): void;
        flushAsync(callback: () => void): void;
        write(value: string): void;
        writeLine(value: string): void;
        writeAsync(value: string, callback: () => void): void;
        writeLineAsync(value: string, callback: () => void): void;
    }
}