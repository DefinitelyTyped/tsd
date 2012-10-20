interface ITTY {
	beep: () => void;
	write: (value: string) => void;
	writeLine: (value: string) => void;
	error: (message: string) => void;
	warn: (message: string) => void;
}