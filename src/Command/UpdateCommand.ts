///<reference path='_ref.ts'/>

module Command {

    class Lib { 
        public name: string;
        public version: string;
        public key: string;
    }

    export class UpdateCommand extends BaseCommand {

        public shortcut: string = "update";
        public usage: string = "Checks if any definition file needs to be updated";
        private args: Array;

        constructor(public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private getVersion(libs: DataSource.Lib[], name: string, strVersion: string): DataSource.LibVersion {
            for (var i = 0; i < libs.length; i++) {
                var lib = libs[i];
                if (lib.name == name) {
                    for (var j = 0; j < lib.versions.length; j++) {
                        var version = lib.versions[j];
                        if (version.version == strVersion) {
                            return version;
                        }
                    }
                    return lib.versions[0];
                }
            }
            return null;
        }

        private _index = 0;
        private _libList: string[] = [];
        private update(lib: string) {
            var ds = Helper.getDataSource(this.cfg.dependencies[lib].repo);

            ds.all((data) => {
                var name = lib.split('@')[0];
                var version = lib.split('@')[1];

                var ver = this.getVersion(data, name, version);
                if (ver) {
                    if (ver.key != this.cfg.dependencies[lib].key) {
                        System.Console.writeLine(Common.format(1, 34, lib) + Common.format(1, 35, '  Update is available!'));
                    } else {
                        System.Console.writeLine(Common.format(1, 34, lib) + Common.format(1, 35, '  Is the latest version.'));
                    }
                }

                if (this._index < this._libList.length) {
                    this.update(this._libList[(this._index++)]);
                } else {
                    System.Console.writeLine('\n');
                }
            });
        }

        public exec(args: Array, callback: (err?, data?) => any): void {

            System.Console.writeLine(' Lib                                  Status');
            System.Console.writeLine(' ------------------------------------ ----------------------------------------');

            for (var lib in this.cfg.dependencies) {
                this._libList.push(lib);
            }

            this.update(this._libList[(this._index++)]);
        }
    }
}