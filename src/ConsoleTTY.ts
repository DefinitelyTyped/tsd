///<reference path='ITTY.ts'/>
///<reference path='ANSIFormat.ts'/>

declare var process: any;

class ConsoleTTY implements ITTY {
	public beep(): void {
		//...
	}

	public write(value: string): void {
	    process.stdout.write(Terminal.ANSIFormat(value));
	}

	public writeLine(value: string): void {
		this.write(value + '\n');
		process.stdout.write('\n');
	}

	public error(message: string): void {
		this.writeLine("{{=red}}" + message + "{{=reset}}");
	}

	public warn(message: string): void {
		this.writeLine("{{=yellow}}" + message + "{{=reset}}");
	}
}