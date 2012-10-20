///<reference path='ITTY.ts'/>
///<reference path='Util\ANSIFormat.ts'/>

declare var process: any;

class TTY implements ITTY {
	public beep(): void {
		//...
	}

	public write(value: string): void {
	    process.stdout.write(Util.Terminal.ANSIFormat(value));
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