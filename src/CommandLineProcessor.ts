///<reference path='TTY.ts'/>
///<reference path='IO.ts'/>
///<reference path='Config.ts'/>
///<reference path='DataSource\IDataSource.ts'/>
///<reference path='Command\ICommand.ts'/>
///<reference path='Command\HelpCommand.ts'/>
///<reference path='Command\AllCommand.ts'/>
///<reference path='Command\SearchCommand.ts'/>
///<reference path='Command\InstallCommand.ts'/>

class CommandLineProcessor {

	commands: Command.ICommand[];

	constructor(public tty: ITTY, public dataSource: DataSource.IDataSource, public io: IIO, public cfg: Config){
		this.commands = [];
		this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(this.tty, this.dataSource));
        this.commands.push(new Command.SearchCommand(this.tty, this.dataSource));
        this.commands.push(new Command.InstallCommand(this.tty, this.dataSource, this.io, this.cfg));
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
    	this.tty.writeLine("{{=cyan}}Command:{{=reset}} " + args[2]);

        var accepted: bool = false;

        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if(command instanceof Command.HelpCommand)
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