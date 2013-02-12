///<reference path='DataSource\IDataSource.ts'/>
///<reference path='Command\Helper.ts'/>
///<reference path='Command\ICommand.ts'/>
///<reference path='Command\HelpCommand.ts'/>
///<reference path='Command\AllCommand.ts'/>
///<reference path='Command\SearchCommand.ts'/>
///<reference path='Command\InstallCommand.ts'/>
///<reference path='Command\UpdateCommand.ts'/>
///<reference path='Command\CreateLocalConfigCommand.ts'/>
///<reference path='Command\InfoCommand.ts'/>
///<reference path='Command\RepoCommand.ts'/>

class CommandLineProcessor {

	commands: Command.ICommand[];

	constructor(public cfg: Config){
 		this.commands = [];
		this.commands.push(new Command.HelpCommand());
		this.commands.push(new Command.AllCommand(cfg));
		this.commands.push(new Command.SearchCommand(cfg));
		this.commands.push(new Command.InstallCommand(cfg));
        //this.commands.push(new Command.UpdateCommand(this.dataSource, this.cfg));
        this.commands.push(new Command.CreateLocalConfigCommand());
        this.commands.push(new Command.InfoCommand(cfg));
        this.commands.push(new Command.RepoCommand(cfg));
 	}

	public printUsage() {
	    System.Console.out.autoFlush = false;
	    
        System.Console.writeLine('Syntax: tsd [command] [args...]');
        System.Console.writeLine('');
        System.Console.writeLine('The following TSD commands are included:');
        System.Console.writeLine('');
        System.Console.writeLine("  Command           Description");
        System.Console.writeLine("  ----------------  ---------------------------------------------------------");
        for(var i = 0; i < this.commands.length; i++) {
            System.Console.writeLine(this.commands[i].toString());
        }
        System.Console.writeLine('');

	    System.Console.out.flush();
	}

    public execute(args: Array) {
        System.Console.writeLine('');
 
        var accepted: bool = false;

        for(var i = 0; i < this.commands.length; i++) {
            var command = this.commands[i];
            if(command.accept(args)) {
                accepted = true;
                if (command instanceof Command.HelpCommand)
                    this.printUsage();
                else {
                    command.exec(args);
                }
            }
        }

        if (!accepted) { 
            this.printUsage();
        }
    }
}