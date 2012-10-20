///<reference path='ICommand.ts'/>

class HelpCommand implements ICommand {

	public shortcut: string = "-h";
	public usage: string = "Print this help message";
	private args: Array;

	public accept(args: Array): bool {
		return args[2] == this.shortcut;
	}

	public exec(args: Array): void {
        //...
	}

	public toString(): string {
		return this.shortcut + "        " + this.usage;
	}
}