import StyledOut = require('../lib/StyledOut');

interface Logger {
	(...args: any[]): void;
	ok(...args: any[]): void;
	log(...args: any[]): void;
	warn(...args: any[]): void;
	error(...args: any[]): void;
	debug(...args: any[]): void;
	status(...args: any[]): void;

	level(level: string, ...args: any[]): void;

	inspect(value: any, label?: string, depth?: number): void;
	json(value: any): void;
	enabled: boolean;
	out: StyledOut;
}

export = Logger;
