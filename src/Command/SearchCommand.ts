///<reference path='_ref.ts'/>

module Command {

    export class SearchCommand extends BaseCommand {

        public shortcut: string = "search";
        public usage: string = "Search a file definition on repository";
        private args: Array;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            var name = lib.name;
            var version = lib.versions[0].version;
            var description = lib.description;

            System.Console.writeLine(Common.format(1, 28, name) + ' ' + Common.format(0, 7, version) + ' ' + Common.format(0, 41, description));
        }

        private match(key: string, name: string) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        }

        private verifyMatch(lib: DataSource.Lib, args: Array): bool {
            var found = false;
            for (var i = 3; i < args.length; i++) {
                var key = args[i];

                if (this.match(key, lib.name)) {
                    found = true;
                }
            }

            return found;
        }

        private showResults(dataSource: DataSource.IDataSource, uriList: string[], args: Array){
            dataSource.all((libs) => {
                var repoNumber = this._indexSync - 1;
                var foundLibs: DataSource.Lib[] = [];

                for (var i = 0; i < libs.length; i++) {
                    var lib = <DataSource.Lib>libs[i];

                    if (this.verifyMatch(lib, args)) {
                        foundLibs.push(lib);
                    }
                }

                if (foundLibs.length == 0) {
                    System.Console.writeLine("   [!] No results found.");
                } else {
                    Command.Helper.printLibs(foundLibs, uriList[repoNumber], repoNumber);
                }

                if (this._indexSync < uriList.length) {
                    this.showResults(Helper.getDataSource(uriList[this._indexSync++]), uriList, args);
                }
            });
        }

        private _indexSync: number = 0;
        public exec(args: Array, callback: (err?, data?) => any): void {
            var uriList = this.cfg.repo.uriList;
            if (this._indexSync < uriList.length) {
                this.showResults(Helper.getDataSource(uriList[this._indexSync++]), uriList, args);
            }
        }
    }
}