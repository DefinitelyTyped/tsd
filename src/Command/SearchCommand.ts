///<reference path='ICommand.ts'/>

module Command {

    export class SearchCommand extends BaseCommand {

        public shortcut: string = "search";
        public usage: string = "Search a file definition on repository";
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

        private match(key: string, name: string) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        }

        private printIfMatch(lib: DataSource.Lib, args: Array): bool {
            var found = false;
            for (var i = 3; i < args.length; i++) {
                var key = args[i];

                if (this.match(key, lib.name)) {
                    this.print(lib);
                    found = true;
                }
            }

            return found;
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
                var count = 0;
                var found = false;
                System.Console.writeLine('');
                System.Console.writeLine(' Name                         Version Description');
                System.Console.writeLine(' ---------------------------- ------- -----------------------------------------');
                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];

                    if (this.printIfMatch(lib, args)) {
                        found = true;
                        count++;
                    }
                }

                if (!found) {
                    System.Console.writeLine("   [!] No results found.");
                } else {
                    System.Console.writeLine(' ------------------------------------------------------------------------------');
                    System.Console.writeLine(' Total found: ' + count + ' lib(s).');
                    System.Console.writeLine('');
                }
            });
        }
    }
}