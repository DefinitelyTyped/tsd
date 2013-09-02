/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

 ///<reference path="../../_ref.ts" />
///<reference path="../KeyValueMap.ts" />
module xm {

	var uriTemplates:URLTemplateParser = require('uri-templates');

	export interface URLTemplateParser {
		(template:string):URLTemplate;
	}
	export interface URLTemplate {
		fillFromObject(vars:any):string;
		fill(callback:(varName:string) => string):string;
		fromUri(uri:string):any;
	}
	/*
	 URLManager: hold url-templates
	 */
	export class URLManager {

		private _templates:xm.KeyValueMap = new xm.KeyValueMap();
		private _vars:any = {};

		constructor(common?:any) {
			if (common) {
				this.setVars(common);
			}
		}

		public addTemplate(id:string, url:string):void {
			if (this._templates.has(id)) {
				throw (new Error('cannot redefine template: ' + id));
			}
			this._templates.set(id, uriTemplates(url));
		}

		public setVar(id:string, value:any):void {
			this._vars[id] = '' + value;
		}

		public getVar(id:string):string {
			if (this._vars.hasOwnProperty(id)) {
				return this._vars[id];
			}
			return null;
		}

		public setVars(map:any):void {
			for (var id in map) {
				if (map.hasOwnProperty(id)) {
					this.setVar(id, map[id]);
				}
			}
		}

		public getTemplate(id:string):URLTemplate {
			if (!this._templates.has(id)) {
				throw (new Error('undefined url template: ' + id));
			}
			return this._templates.get(id);
		}

		public getURL(id:string, vars?:any):string {
			if (vars) {
				return this.getTemplate(id).fillFromObject(_.defaults(vars, this._vars));
			}
			return this.getTemplate(id).fillFromObject(this._vars);
		}
	}
}