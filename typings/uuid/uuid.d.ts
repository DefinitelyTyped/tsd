declare module 'uuid' {
	function current(options?: any, buf?: NodeBuffer, offset?: number): string;

	module current {
		export function v1(options?: any): string;
		export function v1(options: any, buf: NodeBuffer, offset?: number): NodeBuffer;

		export function v4(options?: any): string;
		export function v4(options: any, buf: NodeBuffer, offset?: number): NodeBuffer;

		export function parse(str: string, buf?: NodeBuffer, offset?: number): NodeBuffer;
		export function unparse(buf: NodeBuffer, offset?: number): string;
	}
	export = current;
}
