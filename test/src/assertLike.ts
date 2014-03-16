export interface AssertCB<T> {
	(actual:T, expected:T, message?:string):void;
}
export interface AssertCBA<T> {
	(actual:T[], expected:T[], message?:string):void;
}
export interface IsLikeCB<T> {
	(actual:T, expected:T):boolean;
}
