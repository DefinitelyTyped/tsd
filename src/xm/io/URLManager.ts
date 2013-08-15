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

	var _:UnderscoreStatic = require('underscore');
	var template:URLTemplateParser = require('url-template');

	export interface URLTemplateParser {
		parse(template:string):URLTemplate;
	}
	export interface URLTemplate {
		expand(vars:any):string;
	}

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
			this._templates.set(id, template.parse(url));
		}

		public addTemplates(map:any):void {
			for (var id in map) {
				if (map.hasOwnProperty(id)) {
					this.addTemplate(id, map[id]);
				}
			}
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
				return this.getTemplate(id).expand(_.defaults(vars, this._vars));
			}
			return this.getTemplate(id).expand(this._vars);
		}
	}
}