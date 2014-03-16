/// <reference path="../node/node.d.ts" />
/// <reference path="../form-data/form-data.d.ts" />

// https://github.com/soywiz/typescript-node-definitions
// https://github.com/mikeal/request

declare module "request" {
	export = request;

	import stream = require('stream');
	import http = require('http');
	import FormData = require('form-data');

	function request(uri: string, options?: request.Options, callback?: (error: any, response: any, body: any) => void ): request.Request;
	function request(uri: string, callback?: (error: any, response: any, body: any) => void ): request.Request;
	function request(options: request.Options, callback?: (error: any, response: any, body: any) => void ): request.Request;

	module request {
		export function request(uri: string, options: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export var initParams: any;
		export function defaults(options: any, requester: any): any;
		export function forever(agentOptions: any, optionsArg: any): any;
		export function jar(): CookieJar;
		export function cookie(str: string): Cookie;

		export function get(uri: string, options?: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export function get(uri: string, callback?: (error: any, response: any, body: any) => void ): Request;
		export function get(options: Options, callback?: (error: any, response: any, body: any) => void ): Request;

		export function post(uri: string, options?: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export function post(uri: string, callback?: (error: any, response: any, body: any) => void ): Request;
		export function post(options: Options, callback?: (error: any, response: any, body: any) => void ): Request;

		export function put(uri: string, options?: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export function put(uri: string, callback?: (error: any, response: any, body: any) => void ): Request;
		export function put(options: Options, callback?: (error: any, response: any, body: any) => void ): Request;

		export function head(uri: string, options?: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export function head(uri: string, callback?: (error: any, response: any, body: any) => void ): Request;
		export function head(options: Options, callback?: (error: any, response: any, body: any) => void ): Request;

		export function del(uri: string, options?: Options, callback?: (error: any, response: any, body: any) => void ): Request;
		export function del(uri: string, callback?: (error: any, response: any, body: any) => void ): Request;
		export function del(options: Options, callback?: (error: any, response: any, body: any) => void ): Request;

		interface Options {
			uri?: string;
			callback?: (error: any, response: any, body: any) => void;
			jar?: any;
			form?: any;
			oauth?: any;
			aws?: any;
			qs?: any;
			json?: any;
			multipart?: any;
			ca?: any;
			agentOptions?: any;
			agentClass?: any;
			forever?: any;
			host?: string;
			port?: number;
			method?: string;
			headers?: any;
			body?: any;
			followRedirect?: boolean;
			followAllRedirects?: boolean;
			maxRedirects?: number;
			encoding?: string;
			pool?: any;
			timeout?: number;
			proxy?: any
			strictSSL?: boolean;
		}

		export interface Request extends ReadableStream{
			// _updateProtocol();
			getAgent(): http.Agent;
			//start();
			//abort();
			pipeDest(dest: WritableStream): void;
			setHeader(name: string, value: string, clobber?: boolean): Request;
			setHeaders(headers: any): Request;
			qs(q: any, clobber?: boolean): Request;
			form(form: any): FormData.FormData;
			multipart(multipart: { body: any; }[]): Request;
			json(val: any): Request;
			aws(opts: any, now: Date): Request;
			oauth(oauth: any): Request;
			jar(jar: any): Request;
			write(chunk?: any): void;
			end(chunk?: any):void;
			destroy(): void;
			toJSON(): string;
		}

		export interface CookieJar {
			add(cookie: Cookie): void;
			get(req: Request): Cookie;
			cookieString(req: Request): string;
		}

		export interface Cookie extends Array<{ name: string; value: any; httpOnly: boolean; }> {
			str: string;
			expires: Date;
			path: string;
			toString(): string;
		}

	}
}
