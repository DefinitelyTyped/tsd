///<reference path='ICommand.ts'/>
///<reference path='../ITTY.ts'/>

module Command {

    export class AllCommand implements ICommand {

        public shortcut: string = "all";
        public usage: string = "Show all file definitions from repository";
        private args: Array;

        constructor (public tty: ITTY, public dataSource: DataSource.IDataSource) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            this.tty.write(" {{=cyan}}" + lib.name + " {{=yellow}}[{{=cyan}}");

            for (var j = 0; j < lib.versions.length; j++) {
                if (j > 0 && j < lib.versions.length) {
                    this.tty.write("{{=yellow}},{{=cyan}} ");
                }
                var ver = lib.versions[j];
                this.tty.write(ver.version);
            }

            this.tty.write("{{=yellow}}]{{=reset}}");
            this.tty.writeLine(" - " + lib.description);
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