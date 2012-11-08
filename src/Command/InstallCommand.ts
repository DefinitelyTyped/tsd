///<reference path='ICommand.ts'/>
///<reference path='../System/Web/WebRequest.ts'/>
///<reference path='../System/IO/FileManager.ts'/>
///<reference path='../System/IO/DirectoryManager.ts'/>

module Command {

    export class InstallCommand implements ICommand {
        public shortcut: string = "install";
        public usage: string = "Intall file definition";
        private _args: Array;
        private _cache: string[] = [];
        private _index: number = 0;

        constructor (public dataSource: DataSource.IDataSource, public cfg: Config) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            System.Console.write(lib.name + ' - ' + lib.description + '[');

            for (var j = 0; j < lib.versions.length; j++) {
                if (j > 0 && j < lib.versions.length) {
                    System.Console.write(',');
                }
                var ver = lib.versions[j];
                System.Console.write(ver.version);
            }

            System.Console.writeLine(']');
        }

        private match(key: string, name: string) {
            return name.toUpperCase() == key.toUpperCase();
        }

        private saveFile(name: string, content: string): void { 
            var sw = System.IO.FileManager.handle.createFile(name);
            sw.write(content);
            sw.flush();
            sw.close();
        }

        private save(name: string, version: string, key: string, content: string): void { 
            if(!System.IO.DirectoryManager.handle.directoryExists(this.cfg.localPath)) {
                System.IO.DirectoryManager.handle.createDirectory(this.cfg.localPath);
            }

            var fileNameWithoutExtension = this.cfg.localPath + "/" + name + "-" + version;

            this.saveFile(fileNameWithoutExtension + ".d.ts", content);
            System.Console.writeLine("└── " + name + "@" + version + " instaled.");

            this.saveFile(fileNameWithoutExtension + ".d.key", key);
            System.Console.writeLine("     └── " + key + ".key");
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

        private cacheContains(name: string): bool { 
            for (var i = 0; i < this._cache.length; i++) { 
                if(this._cache[i] == name)
                    return true;
            }
            return false;
        }

        private install(targetLib: DataSource.Lib, targetVersion: string, libs: DataSource.Lib[]): void { 
            if(this.cacheContains(targetLib.name + '@' + targetVersion))
                return;

            if (targetLib == null) {
                System.Console.writeLine("Lib not found.");
            } else {
                var version = targetLib.versions[0];

                System.Web.WebHandler.request.getUrl(version.url, (body) => {
                    this.save(targetLib.name, version.version, version.key, body);
                    this._cache.push(targetLib.name + '@' + version.version);
                    var deps = (<DataSource.LibDep[]>targetLib.versions[0].dependencies) || [];
                    for (var i = 0; i < deps.length; i++) { 
                        var dep: DataSource.Lib = this.find(deps[i].name, libs);
                        this.install(dep, dep.versions[0].version, libs);
                    }
                });
            }
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
                System.Console.writeLine("");
                var targetLib: DataSource.Lib = this.find(args[3], libs);

                if(targetLib)
                    this.install(targetLib, targetLib.versions[0].version, libs);
                else
                    System.Console.writeLine("Lib not found.");
            });
        }

        public toString(): string {
            return this.shortcut + "   " + this.usage;
        }
    }
}