///<reference path='ICommand.ts'/>

module Command {

    export class AllCommand extends BaseCommand {

        public shortcut: string = "all";
        public usage: string = "Show all file definitions from repository";
        private args: Array;

        constructor(public dataSource: DataSource.IDataSource) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {

            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;

            System.Console.writeLine(format(1, 28, name) + ' ' + format(0, 7, version) + ' ' + format(0, 41, description));
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
                System.Console.writeLine('');
                System.Console.writeLine(' Name                         Version Description');
                System.Console.writeLine(' ---------------------------- ------- -----------------------------------------');
                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];
                    this.print(lib);
                }
                System.Console.writeLine(' ------------------------------------------------------------------------------');
                System.Console.writeLine(' Total: ' + libs.length + ' libs.');
                System.Console.writeLine('');
            });
        }
    }
}