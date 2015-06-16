declare module 'uuid' {
	function current(options?: any, buf?: Buffer, offset?: number): string;

	module current {
		export function v1(options?: any): string;
		export function v1(options: any, buf: Buffer, offset?: number): Buffer;

		export function v4(options?: any): string;
		export function v4(options: any, buf: Buffer, offset?: number): Buffer;

		export function parse(str: string, buf?: Buffer, offset?: number): Buffer;
		export function unparse(buf: Buffer, offset?: number): string;
	}
	export = current;
}
