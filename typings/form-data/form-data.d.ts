// https://github.com/felixge/node-form-data

// https://github.com/soywiz/typescript-node-definitions

declare module "form-data" {
	export class FormData {
		append(key: string, value: any): FormData;
		getHeaders(): any;
		pipe(x:any): any;
	}
}
