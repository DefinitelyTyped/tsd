///<reference path='System/Console.js'/>

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

	constructor(public dataSource: DataSource.IDataSource, public io: IIO, public cfg: Config){
		this.commands = [];
		this.commands.push(new Command.HelpCommand());
        this.commands.push(new Command.AllCommand(this.dataSource));
        this.commands.push(new Command.SearchCommand(this.dataSource));
        this.commands.push(new Command.InstallCommand(this.dataSource, this.io, this.cfg));
	}

	public printUsage() {
	    System.Console.out.autoFlush = false;
	    
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('   Ex.: tsd search nodejs');
        System.Console.writeLine('');
        System.Console.writeLine('Options:');

        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine("  " + this.commands[i].toString());
        }

	    System.Console.out.flush();
	}

    public execute(args: Array) {
        System.Console.writeLine("Command: " + (args[2] || "..."));
        System.Console.writeLine('');
 
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