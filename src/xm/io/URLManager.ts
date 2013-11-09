/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../../_ref.d.ts" />
///<reference path="../KeyValueMap.ts" />

module xm {
	'use strict';

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

		private _templates = new xm.KeyValueMap<URLTemplate>();
		private _vars = new xm.KeyValueMap<any>();

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
			this._vars.set(id, value);
		}

		public getVar(id:string):string {
			return this._vars.get(id, null);
		}

		public setVars(map:any):void {
			Object.keys(map).forEach((id) => {
				this._vars.set(id, map[id]);
			});
		}

		public getTemplate(id:string):URLTemplate {
			if (!this._templates.has(id)) {
				throw (new Error('undefined url template: ' + id));
			}
			return this._templates.get(id);
		}

		public getURL(id:string, vars?:any):string {
			if (vars) {
				var obj = this._vars.export();
				Object.keys(vars).forEach((id) => {
					obj[id] = vars[id];
				});
				return this.getTemplate(id).fillFromObject(obj);
			}
			return this.getTemplate(id).fillFromObject(this._vars.export());
		}
	}
}
