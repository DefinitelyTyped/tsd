/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../../_ref.d.ts" />
///<reference path="../KeyValueMap.ts" />
///<reference path="../ObjectUtil.ts" />
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

		private _templates:xm.KeyValueMap = new xm.KeyValueMap();
		private _vars:xm.KeyValueMap = new xm.KeyValueMap();

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
				var name;
				var obj = this._vars.export();
				for (name in vars) {
					if (xm.ObjectUtil.hasOwnProp(vars, name)) {
						obj[name] = vars[name];
					}
				}
				return this.getTemplate(id).fillFromObject(obj);
			}
			return this.getTemplate(id).fillFromObject(this._vars.export());
		}
	}
}
