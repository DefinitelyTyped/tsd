///<reference path='ICommand.ts'/>
///<reference path='../IIO.ts'/>
///<reference path='../Util/WebRequest.ts'/>

module Command {

    export class InstallCommand implements ICommand {
        public shortcut: string = "install";
        public usage: string = "Intall file definition";
        private args: Array;

        constructor (public tty: ITTY, public dataSource: DataSource.IDataSource, public io: IIO, public cfg: Config) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        private print(lib: DataSource.Lib) {
            this.tty.write(" {{=cyan}}" + lib.name + "{{=reset}} - " + lib.description + " {{=yellow}}[{{=cyan}}");

            for (var j = 0; j < lib.versions.length; j++) {
                if (j > 0 && j < lib.versions.length) {
                    this.tty.write("{{=yellow}},{{=cyan}} ");
                }
                var ver = lib.versions[j];
                this.tty.write(ver.version);
            }

            this.tty.writeLine("{{=yellow}}]{{=reset}}");
        }

        private match(key: string, name: string) {
            return name.toUpperCase() == key.toUpperCase();
        }

        private save(name: string, version: string, content: string): void { 
            if (!this.io.directoryExists(this.cfg.localPath)) {
                this.io.createDirectory(this.cfg.localPath);
            }
            this.io.createFile(this.cfg.localPath + "\\" + name + "-" + version + ".d.ts", content);

            this.tty.write("└── " + name + "@" + version + " instaled.");
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

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
                this.tty.writeLine("");

                var targetLib: DataSource.Lib = this.find(args[3], libs);

                if (targetLib == null) {
                    this.tty.warn("Lib not found.");
                } else {
                    var version = targetLib.versions[0];
                    var request = Util.WebRequest.instance();

                    request.getUrl(version.url, (body) => {
                        this.save(targetLib.name, version.version, body);
                    });
                }
            });
        }

        public toString(): string {
            return this.shortcut + "   " + this.usage;
        }
    }
}