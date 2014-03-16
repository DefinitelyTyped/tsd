declare module 'js-yaml' {
	module yaml {
		export function safeLoad(str: string, opts?: LoadOptions): any;
		export function load(str: string, opts?: LoadOptions): any;

		export function safeLoadAll(str: string, iterator: (doc: any) => void, opts?: LoadOptions): any;
		export function loadAll(str: string, iterator: (doc: any) => void, opts?: LoadOptions): any;

		export function safeDump(obj: any, opts?: DumpOptions): string;
		export function dump(obj: any, opts?: DumpOptions): string

		export interface LoadOptions {
			// string to be used as a file path in error/warning messages.
			filename?: string;
			// makes the loader to throw errors instead of warnings.
			strict?: boolean;
			// specifies a schema to use.
			schema?: Schema;
		}

		export interface DumpOptions {
			// indentation width to use (in spaces).
			indent?: number;
			// do not throw on invalid types (like function in the safe schema) and skip pairs and single values with such types.
			skipInvalid?: boolean;
			// specifies level of nesting, when to switch from block to flow style for collections. -1 means block style everwhere
			flowLevel?: number;
			// Each tag may have own set of styles.  - "tag" => "style" map.
			styles?: Object;
			// specifies a schema to use.
			schema?: Schema;
		}

		export interface Schema {

		}

		// only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346
		export var FAILSAFE_SCHEMA: Schema;
		// only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346
		export var JSON_SCHEMA: Schema;
		// same as JSON_SCHEMA: http://www.yaml.org/spec/1.2/spec.html#id2804923
		export var CORE_SCHEMA: Schema;
		// all supported YAML types, without unsafe ones (!!js/undefined, !!js/regexp and !!js/function): http://yaml.org/type/
		export var DEFAULT_SAFE_SCHEMA: Schema;
		// all supported YAML types.
		export var DEFAULT_FULL_SCHEMA: Schema;
	}
	export = yaml;
}
