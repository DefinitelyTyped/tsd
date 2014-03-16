declare module 'config-store' {
	/*
	 Set an item
	 */
	export function set(key: string, val: any): void;

	/*
	 Get an item
	 */
	export function get(key: string): any;

	/*
	 Delete an item
	 */
	export function del(key: string): void;

	/*
	 Get all items as an object or replace the current config with an object:

	 conf.all = {
	    hello: 'world'
	 };
	 */
	export var all: Object;
	/*
	 Get the item count
	 */
	export var size: number;
	/*
	 Get the path to the config file. Can be used to show the user where the config file is located or even better open it for them.
	 */
	export var path: string;
}
