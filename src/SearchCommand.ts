///<reference path='ICommand.ts'/>

class SearchCommand implements ICommand { 

	public shortcut: string = "search";
	public usage: string = "Search a file definition on repository";
	private args: Array;

	constructor (public tty: ITTY, public dataSource: IDataSource) { }

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
	    return name.indexOf(key) != -1;
    }

	private printIfMatch(lib: Lib, args: Array): bool { 
	    var found = false;
	    for (var i = 0; i < args.length; i++) { 
	        var key = args[i];
	        if (this.match(key, lib.name)) { 
	            this.print(lib);
	            found = true;
            }
        }

	    return found;
    }

	public exec(args: Array): void {
	    this.dataSource.all((libs) => { 
	        var found = false;
            this.tty.writeLine("{{=cyan}}Search results:{{=reset}}");
            this.tty.writeLine("");

            for (var i = 0; i < libs.length; i++) {
                var lib = <Lib>libs[i];
                if (this.printIfMatch(lib, args)) { 
                    found = true;
                }
            }

            if (!found) { 
                this.tty.warn("No results found.");
            }
        });
	}

	public toString(): string {
		return this.shortcut + "    " + this.usage;
	}
}