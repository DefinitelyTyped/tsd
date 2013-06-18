///<reference path='_ref.ts'/>

module Command {

    export class RepoCommand extends BaseCommand {
        public shortcut: string = "repo";
        public usage: string = "Show repo list";
        private _args: Array;
        private _index: number = 0;
        private _withRepoIndex = false;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        public exec(args: Array, callback: (err?, data?) => any): void {
            var uriList = this.cfg.repo.uriList;
            if (uriList.length > 0) {
                var index = 0;
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' REPOSITORY LIST ');
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                for (var i = 0; i < uriList.length; i++) {
                    System.Console.writeLine(' [' + (index++) + '] ' + uriList[i]);
                }
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' Total: ' + uriList.length + ' repositories.\n');
            }
        }
    }
}