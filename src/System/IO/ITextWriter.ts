///<reference path='../IDisposable.ts'/>

module System.IO {
    export interface ITextWriter extends System.IDisposable {
        close(): void;
        flush(): void;
        flushAsync(callback: () => void): void;
        write(value: string): void;
        write(format: string, ...arg: any[]): void;
    }
}