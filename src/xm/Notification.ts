/// <reference path="typeOf.ts" />

module xm {
	export interface Notification {
		code:string;
		message:string;
		data:any;
	}

	export function getNote(message:string, code?:any, data?:any):Notification {
		return {
			code: (xm.isValid(code) ? String(code) : null),
			message: message,
			data: data
		};
	}
}
