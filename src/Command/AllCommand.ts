///<reference path='ICommand.ts'/>

module Command {

    export class AllCommand implements ICommand {

        public shortcut: string = "all";
        public usage: string = "Show all file definitions from repository";
        private args: Array;

        constructor (public dataSource: DataSource.IDataSource) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            System.Console.write(' ' + lib.name + '[');

            for (var j = 0; j < lib.versions.length; j++) {
                if (j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }

            System.Console.write(']');
            System.Console.writeLine(' - '+ lib.description);
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];
                    this.print(lib);
                }
            });
        }

        public toString(): string {
            return this.shortcut + "       " + this.usage;
        }
    }
}