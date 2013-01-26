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

        constructor(public dataSource: DataSource.IDataSource) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut && args[3];
        }

        private match(key: string, name: string) {
            return name.toUpperCase() == key.toUpperCase();
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
                System.Console.writeLine("   [!] Lib not found.");
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

        public exec(args: Array): void {
            var targetLib: DataSource.Lib;

            var tryGetInfo = (libs, lib: string) => {
                targetLib = this.find(lib, libs);

                if (targetLib)
                    this.display(targetLib, targetLib.versions[0].version, libs);
                else
                    System.Console.writeLine("   [!] Lib not found.");
            };

            this.dataSource.all((libs) => {
                var index = 3;
                var lib = args[index];
                tryGetInfo(libs, lib);
            });
        }
    }
}