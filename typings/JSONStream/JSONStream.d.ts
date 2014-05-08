/// <reference path="../node/node.d.ts" />

declare module 'JSONStream' {

	export interface Options {
		recurse: boolean;
	}

	export function parse(pattern: any): NodeJS.ReadWriteStream;
	export function parse(patterns: any[]): NodeJS.ReadWriteStream;

	export function stringify(): NodeJS.ReadWriteStream;
	export function stringify(open: string, sep: string, close: string): NodeJS.ReadWriteStream;

	export function stringifyObject(): NodeJS.ReadWriteStream;
	export function stringifyObject(open: string, sep: string, close: string): NodeJS.ReadWriteStream;
}
