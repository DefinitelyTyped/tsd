module Command {

    export interface ICommand {
        shortcut: string;
        usage: string;
        accept: (args: Array) => bool;
        exec: (args: Array) => void;
        toString: () => string;
    }

    export class BaseCommand implements ICommand {
        shortcut: string;
        usage: string;
        accept(args: Array): bool { throw new Error("Not implemented exception"); }
        exec(args: Array): void { throw new Error("Not implemented exception"); }

        toString(): string {
            return format(2, 15, this.shortcut) + "   " + format(0, 57, this.usage);
        }
    }
}