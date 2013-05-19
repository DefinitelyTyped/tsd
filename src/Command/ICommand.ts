///<reference path='../Common.ts'/>

module Command {

    export interface ICommand {
        shortcut: string;
        usage: string;
        accept: (args: Array) => bool;
        exec: (args: Array, callback: (err?, data?) => any) => void;
        toString: () => string;
    }

    export class BaseCommand implements ICommand {
        shortcut: string;
        usage: string;
        accept(args: Array): bool { throw new Error("Not implemented exception"); }
        exec(args: Array, callback: (err?, data?) => any): void { throw new Error("Not implemented exception"); }

        toString(): string {
            return Common.format(2, 15, this.shortcut) + "   " + Common.format(0, 57, this.usage);
        }
    }
}