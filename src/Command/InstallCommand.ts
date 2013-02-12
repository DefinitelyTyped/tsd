///<reference path='ICommand.ts'/>
///<reference path='../System/Web/WebRequest.ts'/>
///<reference path='../System/IO/FileManager.ts'/>
///<reference path='../System/IO/DirectoryManager.ts'/>
///<reference path='../System/Console.ts'/>
///<reference path='../System/Uri.ts'/>

module Command {

    export class InstallCommand extends BaseCommand {
        public shortcut: string = "install";
        public usage: string = "Intall file definition. Use install* to map dependencies.";
        private _args: Array;
        private _cache: string[] = [];
        private _index: number = 0;
        private _withDep = false;
        private _withRepoIndex = false;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return (args[2] == this.shortcut || args[2] == this.shortcut + '*') && args[3];
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

        private normalizeGithubUrl(uri: UriParsedObject) {
            if (uri.host == 'github.com') {
                var parts = uri.directory.split('/');
                var repo = /*parts[1] + '_' +*/ parts[2];
                var ignore = '/' + parts[1] + '/' + parts[2] + '/' + parts[3] + '/' + parts[4];
                uri.directory = '/' + repo + uri.directory.substr(ignore.length);
            }
        }

        private save(url: string, name: string, version: string, key: string, content: string, tsdUri: TsdUri): void {
            var uri = Uri.parseUri(url);
            this.normalizeGithubUrl(uri);

            if(!System.IO.DirectoryManager.handle.directoryExists(this.cfg.localPath + uri.directory)) {
                System.IO.DirectoryManager.handle.createDirectory(this.cfg.localPath + uri.directory);
            }

            var fileNameWithoutExtension = this.cfg.localPath + uri.directory + name;// + "-" + version;

            this.saveFile(fileNameWithoutExtension + ".d.ts", content);
            System.Console.writeLine("+-- " + name + "@" + version + " -> " + this.cfg.localPath + uri.directory);

            this.cfg.addDependency(name, version, key, tsdUri);

            System.Console.writeLine("");

            this.cfg.save();
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
            if(this.cacheContains(targetLib.name))
                return;

            if (targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = targetLib.versions[0];

                Helper.getSourceContent(version.uri, (body: string) => {
                    this.save(version.uri.source, targetLib.name, version.version, version.key, body, version.uri);
                    this._cache.push(targetLib.name);

                    if (!this._withDep)
                        return;

                    var deps = (<DataSource.LibDep[]>targetLib.versions[0].dependencies) || [];
                    for (var i = 0; i < deps.length; i++) {
                        var dep: DataSource.Lib = this.find(deps[i].name, libs);
                        this.install(dep, dep.versions[0].version, libs);
                    }
                });

                /*
                System.Web.WebHandler.request.getUrl(version.uri.source, (body) => {
                    this.save(version.uri.source, targetLib.name, version.version, version.key, body);
                    this._cache.push(targetLib.name);

                    if (!this._withDep)
                        return;

                    var deps = (<DataSource.LibDep[]>targetLib.versions[0].dependencies) || [];
                    for (var i = 0; i < deps.length; i++) {
                        var dep: DataSource.Lib = this.find(deps[i].name, libs);
                        this.install(dep, dep.versions[0].version, libs);
                    }
                });*/
            }
        }

        private execInternal(index: number, uriList: TsdUri[], args: Array) {
            var targetLib: DataSource.Lib;

            var tryInstall = (libs, lib: string) => {
                targetLib = this.find(lib, libs);

                if (targetLib)
                    this.install(targetLib, targetLib.versions[0].version, libs);
                else
                    System.Console.writeLine("   [!] Lib not found.\n");
            };

            var dataSource = Helper.getDataSource(uriList[index]);
            dataSource.all((libs) => {
                var index = (this._withRepoIndex ? 4 : 3);
                var lib = args[index];
                while (lib) {
                    tryInstall(libs, lib);
                    index++;
                    lib = args[index];
                }
            });
        }

        public exec(args: Array): void {
            if (args[2].indexOf('*') != -1) {
                this._withDep = true;
            }

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