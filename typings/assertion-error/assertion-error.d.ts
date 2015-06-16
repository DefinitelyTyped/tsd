declare class AssertionError implements Error {
	constructor(message: string, _props?: any, ssf?: Function);
	name: string;
	message: string;
	showDiff: boolean;
	stack: string;
}
declare module 'assertion-error' {
	export = AssertionError;
}
