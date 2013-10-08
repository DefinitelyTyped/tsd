// Type definitions for Q
// Project: https://github.com/kriskowal/q
// Definitions by: Barrie Nemetchek
// Definitions: https://github.com/borisyankov/DefinitelyTyped  



//          note these are old TS 0.8 defs : need t be swapped for TS 0.9 generic ones.




interface Qdeferred {
	promise: Qpromise;
	resolve(value: any): any;
	reject(reason: any);
	notify(value: any);
	makeNodeResolver(): () => void;
}

interface Qpromise {
	fail(errorCallback: Function): Qpromise;
	fin(finallyCallback: Function): Qpromise;
	then(onFulfilled?: Function, onRejected?: Function, onProgress?: Function): Qpromise;
	thenResolve(value: any): Qpromise;
	thenReject(reason: any): Qpromise;

	spread(onFulfilled: Function, onRejected?: Function): Qpromise;
	catch(onRejected: Function): Qpromise;
	progress(onProgress: Function): Qpromise;
	done(onFulfilled?: Function, onRejected?: Function, onProgress?: Function): Qpromise;
	get (propertyName: String): Qpromise;
	set (propertyName: String, value: any): Qpromise;
	delete (propertyName: String): Qpromise;
	post(methodName: String, args: any[]): Qpromise;
	invoke(methodName: String, ...args: any[]): Qpromise;
	keys(): Qpromise;
	fapply(args: any[]): Qpromise;
	fcall(method: Function, ...args: any[]): Qpromise;
	timeout(ms: number): Qpromise;
	delay(ms: number): Qpromise;
	isFulfilled(): boolean;
	isRejected(): boolean;
	isPending(): boolean;
	valueOf(): any;
}

interface QStatic {
	when(value: any, onFulfilled?: Function, onRejected?: Function): Qpromise;
	try(method: Function, ...args: any[]): Qpromise;
	fbind(method: Function, ...args: any[]): Qpromise;
	fcall(method: Function, ...args: any[]): Qpromise;

	nfcall(method: Function, ...args: any[]): Qpromise;
	nfapply(method: Function, args: any[]): Qpromise;
	ninvoke(scope: any, methodName: string, ...args: any[]): Qpromise;
	npost(scope: any, methodName: string, args: any[]): Qpromise;

	denodeify(method: Function): Function;
	nbind(method: Function, scope: any): Function;


	all(promises: Qpromise[]): Qpromise;
	allResolved(promises: Qpromise[]): Qpromise;
	allSettled(values: any[]): Qpromise;

	resolve(object:any):Qpromise;
	spread(onFulfilled: Function, onRejected: Function): Qpromise;
	timeout(ms: number): Qpromise;
	delay(ms: number): Qpromise;
	delay(value: any, ms: number): Qpromise;
	isFulfilled(): boolean;
	isRejected(): boolean;
	isPending(): boolean;
	valueOf(): any;
	defer(): Qdeferred;
	(value: any): Qpromise;
	reject(reason :any): Qpromise;
	promise(factory: { resolve: Function; reject: Function; notify: Function; }): Qpromise;
	isPromise(value: any): boolean;
	async(generatorFunction: any): Qdeferred;
	nextTick(callback: Function);
	oneerror: any;
	longStackJumpLimit: number;
	longStackSupport: boolean;
}
declare var Q: QStatic;
