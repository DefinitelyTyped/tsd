///<reference path='ICommand.ts'/>
///<reference path='ITTY.ts'/>

class AllCommand implements ICommand { 

	public shortcut: string = "all";
	public usage: string = "Show all file definitions from repository";
	private args: Array;

	constructor (public tty: ITTY, public dataSource: IDataSource) { }

	public accept(args: Array): bool {
		return args[2] == this.shortcut;
	}

	public exec(args: Array): void {
	    this.dataSource.all((libs) => { 
            for (var i = 0; i < libs.length; i++) { 
                var lib = <Lib>libs[i];
                this.tty.write(" " + lib.name + " - " + lib.description + " [");

                for (var j = 0; j < lib.versions.length; j++) { 
                    if (j > 0 && j < lib.versions.length) { 
                        this.tty.write(", ");
                    }
                    var ver = lib.versions[j];
                    this.tty.write(ver.version);
                }

                this.tty.writeLine("]");
            }
        });
	}

	public toString(): string {
		return this.shortcut + "       " + this.usage;
	}
}