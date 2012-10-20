///<reference path='ICommand.ts'/>

module Command {

    export class SearchCommand implements ICommand {

        public shortcut: string = "search";
        public usage: string = "Search a file definition on repository";
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

        private match(key: string, name: string) {
            return name.indexOf(key) != -1;
        }

        private printIfMatch(lib: DataSource.Lib, args: Array): bool {
            var found = false;
            for (var i = 3; i < args.length; i++) {
                var key = args[i];
                Util.Trace.log("arg[" + i + "]: " + key);

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
                this.tty.writeLine("{{=cyan}}Search results:{{=reset}}");
                this.tty.writeLine("");

                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];
                    Util.Trace.log("test match for lib: " + lib.name);

                    if (this.printIfMatch(lib, args)) {
                        found = true;
                    }
                }

                if (!found) {
                    this.tty.warn("No results found.");
                }
            });
        }

        public toString(): string {
            return this.shortcut + "    " + this.usage;
        }
    }
}