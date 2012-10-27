///<reference path='ICommand.ts'/>
///<reference path='../System/IO/DirectoryManager.ts'/>

module Command {

    class Lib { 
        public name: string;
        public version: string;
        public key: string;
    }

    export class UpdateCommand implements ICommand {

        public shortcut: string = "update";
        public usage: string = "Checks if any definition file needs to be updated";
        private args: Array;

        constructor (public dataSource: DataSource.IDataSource, public cfg: Config) { }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
					
				var libList: Lib[] = [];
				var files = System.IO.DirectoryManager.handle.getAllFiles(this.cfg.localPath);

				for (var i = 0; i < files.length; i++) {

					var file = files[i].substr(this.cfg.localPath.length + 1);
					if (file.substr(file.length - 5) == 'd.key') {
						var name = file.substr(0, file.lastIndexOf('-'));
						var version = file.substr(name.length + 1, file.length - name.length - 7);
						var key = System.IO.FileManager.handle.readFile(files[i]);

						var flg = false;

						for (var j = 0; j < libs.length; j++) {
							var lib = <DataSource.Lib>libs[j];

							if (name == lib.name) { 
								if (version == lib.versions[0].version) { 
									if (key != lib.versions[0].key) { 
										System.Console.writeLine(
                                            ' ' + (System.Environment.isNode() ? '\033[36m' : '') + name + (System.Environment.isNode() ? '\033[0m' : '') + ' - '
                                            + (System.Environment.isNode() ? '\033[33m' : '') + 'A new version is available!' + (System.Environment.isNode() ? '\033[0m' : '') );
										flg = true;
									}
								}
							}
						}

						if (!flg) { 
							System.Console.writeLine(
                                ' ' + (System.Environment.isNode() ? '\033[36m' : '') + name + (System.Environment.isNode() ? '\033[0m' : '') + ' - '
                                + 'Lib is out of date.');
						}
					}
				}
						
            });
        }

        public toString(): string {
            return this.shortcut + "    " + this.usage;
        }
    }
}