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
        private _isFull: bool;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return (args[2] == this.shortcut || args[2] == this.shortcut + '*' || args[2] == this.shortcut + '-all') /*&& args[3]*/;
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

        private save(url: string, name: string, version: string, key: string, content: string, tsdUri: TsdUri, repo: TsdUri): void {
            var uri = Uri.parseUri(url);

            this.normalizeGithubUrl(uri);

            var path = '';

            if (tsdUri.relative) {
                path = this.cfg.typingsPath + '/' + tsdUri.relative + '/';
            } else {
                path = this.cfg.typingsPath + uri.directory;
            }

            if (!System.IO.DirectoryManager.handle.directoryExists(path)) {
                System.IO.DirectoryManager.handle.createDirectory(path);
            }

            this.saveFile(path + name + ".d.ts", content);
            System.Console.writeLine("+-- " + name + "@" + version + " -> " + path);

            System.Console.writeLine("");

            if (repo) {
                this.cfg.addDependency(name, version, key, tsdUri, repo);
                this.cfg.save();
            }
        }

        private saveLib(tsdUri: TsdUri): void {
            var uri = Uri.parseUri(tsdUri.source);

            this.normalizeGithubUrl(uri);

            var path = '';

            if (tsdUri.relative) {
                path = this.cfg.libPath + '/' + tsdUri.relative + '/';
            } else {
                path = this.cfg.libPath + uri.directory;
            }

            if (tsdUri.pre) {
                path = path + uri.directory.substr(tsdUri.pre.length);
            }

            if (!System.IO.DirectoryManager.handle.directoryExists(path)) {
                System.IO.DirectoryManager.handle.createDirectory(path);
            }

            var name = uri.file;

            Helper.getSourceContent(tsdUri, (body: string) => {
                this.saveFile(path + '/' + name, body);
                System.Console.writeLine("+-- " + name + " -> " + path + name + '\n');
            });
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

        private getVersion(versions: DataSource.LibVersion[], strVersion: string): DataSource.LibVersion {
            for (var i = 0; i < versions.length; i++) {
                var version = versions[i];
                if (version.version == strVersion) {
                    return version;
                }
            }
            return versions[0];
        }

        private install(targetLib: DataSource.Lib, targetVersion: string, libs: DataSource.Lib[], repo: TsdUri): void { 
            if(this.cacheContains(targetLib.name))
                return;

            if (targetLib == null) {
                System.Console.writeLine("   [!] Lib not found.\n");
            } else {
                var version = this.getVersion(targetLib.versions, targetVersion);

                Helper.getSourceContent(version.uri, (body: string) => {
                    this.save(version.uri.source, targetLib.name, version.version, version.key, body, version.uri, repo);
                    this._cache.push(targetLib.name);

                    if (this._isFull) {
                        var lib = (version.lib || {});
                        if (lib.sources) {
                            for (var i = 0; i < lib.sources.length; i++) {
                                var source = <{ uri: TsdUri; }>lib.sources[i];
                                this.saveLib(source.uri);
                            }
                        }
                    }

                    if (this._withDep) {
                        var deps = (<DataSource.LibDep[]>version.dependencies) || [];
                        for (var i = 0; i < deps.length; i++) {
                            var dep: DataSource.Lib = this.find(deps[i].name, libs);
                            this.install(dep, dep.versions[0].version, libs, this.cfg.repo.uriList[0]);
                        }
                    }
                });
            }
        }

        private execInternal(index: number, uriList: TsdUri[], args: Array) {
            var targetLib: DataSource.Lib;

            var tryInstall = (libs, lib: string) => {
                targetLib = this.find(lib.split('@')[0], libs);

                if (targetLib) {
                    var name = lib.split('@')[0];
                    var version = lib.split('@')[1];
                    this.install(targetLib, version || targetLib.versions[0].version, libs, uriList[index]);
                } else
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

        private installFromConfig() {
            var libs: DataSource.Lib[] = [];
            for (var dep in this.cfg.dependencies) {
                var name = dep.split('@')[0];
                var version = dep.split('@')[1];
                var key = this.cfg.dependencies[dep].key;
                var uri = this.cfg.dependencies[dep].uri;

                var lib: DataSource.Lib = new DataSource.Lib();
                lib.name = name;
                lib.versions.push(<DataSource.LibVersion>{
                    version: version,
                    key: key,
                    dependencies: [],
                    uri: uri,
                    lib: []
                });
                libs.push(lib);
            }

            for (var i = 0; i < libs.length; i++) {
                this.install(libs[i], libs[i].versions[0].version, [], null);
            }
        }

        public exec(args: Array): void {
            if (args[2].indexOf('*') != -1) {
                this._withDep = true;
            }
            else if (args[2] == this.shortcut + '-all') { // issue #13
                this._withDep = true;
            }
			
            // if only 'install'
            if (!args[3]) {
                this.installFromConfig();
            } else {
                if (args[args.length - 1] == 'full') {
                    this._isFull = true;
                    args.pop();
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
}