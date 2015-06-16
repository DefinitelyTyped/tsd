declare module 'verror' {
	class VError implements Error {
		constructor(cause: Error, message: string, ...vars: any[]);
		constructor(message: string, ...vars: any[]);
		name: string;
		message: string;
		cause(): Error;
	}

	module VError {
		export var WError: typeof VError;
	}

	export = VError;
}
