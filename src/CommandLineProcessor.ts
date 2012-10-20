///<reference path='ConsoleTTY.ts'/>
///<reference path='IO.ts'/>
///<reference path='Config.ts'/>
///<reference path='IDataSource.ts'/>
///<reference path='HelpCommand.ts'/>
///<reference path='AllCommand.ts'/>
///<reference path='SearchCommand.ts'/>
///<reference path='InstallCommand.ts'/>

class CommandLineProcessor {

	commands: ICommand[];

	constructor(public tty: ITTY, public dataSource: IDataSource, public io: IIO, public cfg: Config){
		this.commands = new ICommand[];
		this.commands.push(new HelpCommand());
        this.commands.push(new AllCommand(this.tty, this.dataSource));
        this.commands.push(new SearchCommand(this.tty, this.dataSource));
        this.commands.push(new InstallCommand(this.tty, this.dataSource, this.io, this.cfg));
	}

	public printUsage() {
        this.tty.writeLine("{{=cyan}}Syntax:{{=reset}}   tsd {{=yellow}}[{{=cyan}}command{{=yellow}}] [{{=cyan}}args...{{=yellow}}]{{=reset}}");
        this.tty.writeLine("");
        this.tty.writeLine("   {{=cyan}}Ex.:{{=reset}} tsd search nodejs");
        this.tty.writeLine("");
        this.tty.writeLine("{{=cyan}}Options:{{=reset}}");

        for(var i = 0; i < this.commands.length; i++) {
    		this.tty.writeLine("  " + this.commands[i].toString());
        }
	}

    public execute(args: Array) {
        var accepted: bool = false;

        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof HelpCommand)
                    this.printUsage();
                else
                    command.exec(args);
            }
        }

        if (!accepted) { 
            this.printUsage();
        }
    }
}