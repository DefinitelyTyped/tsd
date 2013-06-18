///<reference path='_ref.ts'/>

module Command {

    export class HelpCommand extends BaseCommand {

        public shortcut: string = "-h";
        public usage: string = "Print this help message";
        private args: Array;

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        public exec(args: Array, callback: (err?, data?) => any): void {
            //...
        }
    }
}