///<reference path='ICommand.ts'/>

module Command {

    export class SearchCommand implements ICommand {

        public shortcut: string = "search";
        public usage: string = "Search a file definition on repository";
        private args: Array;

        constructor (public dataSource: DataSource.IDataSource) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            System.Console.write(' ' + (System.Environment.isNode() ? '\033[36m' : '') + lib.name + (System.Environment.isNode() ? '\033[0m' : '') + '[');

            for (var j = 0; j < lib.versions.length; j++) {
                if (j > 0 && j < lib.versions.length) {
                    System.Console.write(", ");
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }

            System.Console.write("]");
            System.Console.writeLine(" - " + lib.description);
        }

        private match(key: string, name: string) {
            return name.indexOf(key) != -1;
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
                var found = false;
                System.Console.writeLine("Search results:");
                System.Console.writeLine("");

                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];

                    if (this.printIfMatch(lib, args)) {
                        found = true;
                    }
                }

                if (!found) {
                    System.Console.writeLine("No results found.");
                }
            });
        }

        public toString(): string {
            return this.shortcut + "    " + this.usage;
        }
    }
}