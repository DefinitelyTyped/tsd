///<reference path='ICommand.ts'/>
///<reference path='../System/Web/WebRequest.ts'/>
///<reference path='../System/IO/FileManager.ts'/>
///<reference path='../System/IO/DirectoryManager.ts'/>
///<reference path='../System/Console.ts'/>
///<reference path='../System/Uri.ts'/>

module Command {

    export class InfoCommand extends BaseCommand {
        public shortcut: string = "info";
        public usage: string = "Get lib information";
        private _args: Array;
        private _index: number = 0;
        private _withRepoIndex = false;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut && args[3];
        }

        private match(key: string, name: string) {
            return name.toUpperCase().indexOf(key.toUpperCase()) != -1;
        }

        private find(key: string, libs: DataSource.Lib[]): DataSource.Lib { 
            for (var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if (this.match(lib.name, key)) {
                    return lib;
                }
            }

            return null;
        }

        private display(targetLib: DataSource.Lib, targetVersion: string, libs: DataSource.Lib[]): void { 

            if (targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = targetLib.versions[0];

                System.Web.WebHandler.request.getUrl(version.url, (body) => {

                    System.Console.writeLine("");
                    System.Console.writeLine("         name: " + targetLib.name);
                    System.Console.writeLine("  description: " + format(0, 60, targetLib.description));
                    System.Console.writeLine("          key: " + version.key);
                    System.Console.writeLine("      version: " + version.version);
                    System.Console.writeLine("       author: " + version.author);
                    System.Console.writeLine("          url: " + format(0, 60, version.url));
                    System.Console.writeLine("");
                });
            }
        }

        private execInternal(index: number, uriList: RepoUri[], args: Array) {
            var targetLib: DataSource.Lib;

            var tryGetInfo = (libs, lib: string) => {
                targetLib = this.find(lib, libs);

                if (targetLib)
                    this.display(targetLib, targetLib.versions[0].version, libs);
                else
                    System.Console.writeLine("   [!] Lib not found.\n");
            };

            var dataSource = DataSource.DataSourceFactory.factory(uriList[index]);
            dataSource.all((libs) => {
                var index = (this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                tryGetInfo(libs, lib);
            });
        }

        public exec(args: Array): void {
            var uriList = this.cfg.repo.uriList;
            if (args[3].indexOf('!') != -1) {
                this._withRepoIndex = true;
                var index = parseInt(args[3][1]);
                if (index.toString() != "NaN") {
                    this.execInternal(index, uriList, args);
                } else {
                    System.Console.writeLine("   [!] Invalid repository index.\n");
                }
            } else {
                this.execInternal(0, uriList, args);
            }
        }
    }
}