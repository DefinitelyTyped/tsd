///<reference path='ICommand.ts'/>
///<reference path='IIO.ts'/>

class InstallCommand implements ICommand { 
	public shortcut: string = "install";
	public usage: string = "Intall file definition";
	private args: Array;

    constructor (public tty: ITTY, public dataSource: IDataSource, public io: IIO, public cfg: Config) { }

	public accept(args: Array): bool {
		return args[2] == this.shortcut;
	}

	private print(lib: Lib) { 
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

	public exec(args: Array): void {
	    this.dataSource.all((libs) => { 
	        var targetLib: Lib = null;
            this.tty.writeLine("");

            for (var i = 0; i < libs.length; i++) {
                var lib = <Lib>libs[i];
                if (this.match(lib.name, args[3])) { 
                    targetLib = lib;
                    break;
                }
            }

            if (targetLib == null) {
                this.tty.warn("Lib not found.");
            } else { 
                var version = targetLib.versions[0];
                var request = require('request');

		        request(version.url, (error, response, body) => {
			        if (!error && response.statusCode == 200) {

			            if (!this.io.directoryExists(this.cfg.localPath)) { 
			                this.io.createDirectory(this.cfg.localPath);
                        }
			            this.io.createFile(this.cfg.localPath + "\\" + targetLib.name + "-" + version.version + ".d.ts", body);

                        this.tty.write(targetLib.name + " instaled.");
			        }
		        });
            }
        });
	}

	public toString(): string {
		return this.shortcut + "   " + this.usage;
	}
}
