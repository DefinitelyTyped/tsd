///<reference path='ICommand.ts'/>
///<reference path='../System/IO/DirectoryManager.ts'/>
///<reference path='../System/Console.ts'/>

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

        constructor(public dataSource: DataSource.IDataSource, public cfg: Config) { super(); }

        public accept(args: Array): bool {
            return args[2] == this.shortcut;
        }

        public exec(args: Array): void {
            this.dataSource.all((libs) => {
					
                var libList: Lib[] = [];
                var files = [];

                try {
                    files = System.IO.DirectoryManager.handle.getAllFiles(this.cfg.typingsPath, /.d\.key$/g, { recursive: true });
                } catch (e) {
                    System.Console.writeLine('Empty directory.');
                    System.Console.writeLine('');
                    return;
                }


                System.Console.writeLine(' Lib                                  Status');
                System.Console.writeLine(' ------------------------------------ ----------------------------------------');

				for (var i = 0; i < files.length; i++) {

				    var file = files[i].substr(this.cfg.typingsPath.length + 1);
					var name = file.substr(0, file.lastIndexOf('.'));
					var version = file.substr(name.length + 1, file.length - name.length - 7);
					var key = System.IO.FileManager.handle.readFile(files[i]);

					var flg = false;

					for (var j = 0; j < libs.length; j++) {
						var lib = <DataSource.Lib>libs[j];

						if (name == lib.name) { 
							if (version == lib.versions[0].version) { 
							    if (key != lib.versions[0].key) {
							        var lname = name.split('/')[name.split('/').length - 1];
							        var dir = name;
							        System.Console.writeLine(format(1, 35, lname.substr(0, lname.length - 2) + ' @ ./' + dir) + '  Update is available!');
									flg = true;
								}
							}
						}
					}

					if (!flg) { 
					    var lname = name.split('/')[name.split('/').length - 1];
					    var dir = name;
					    System.Console.writeLine(format(1, 35, lname.substr(0, lname.length - 2) + ' @ ./' + dir) + '  Is the latest version.');
					}
				}
				System.Console.writeLine('');
            });
        }
    }
}