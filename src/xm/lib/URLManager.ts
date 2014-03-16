/// <reference path="../_ref.d.ts" />

import uriTemplates = require('uri-templates');
import typeOf = require('../typeOf');

interface URLTemplateParser {
	(template: string):URLTemplate;
}
/*
 URLManager: hold url-templates
 */
class URLManager {

	private _templates: {[id:string]:URLTemplate} = Object.create(null);
	private _vars = Object.create(null);

	constructor(common?: any) {
		if (common) {
			this.setVars(common);
		}
	}

	public addTemplate(id: string, url: string): void {
		if (id in this._templates) {
			throw (new Error('cannot redefine template: ' + id));
		}
		this._templates[id] = uriTemplates(url);
	}

	public setVar(id: string, value: any): void {
		this._vars[id] = value;
	}

	public getVar(id: string): string {
		return (id in this._vars ? this._vars[id] : null);
	}

	public setVars(map: any): void {
		Object.keys(map).forEach((id) => {
			if (typeOf.isValid(map[id])) {
				this._vars[id] = map[id];
			}
			else {
				delete this._vars[id];
			}
		});
	}

	public getTemplate(id: string): URLTemplate {
		if (id in this._templates) {
			return this._templates[id];
		}
		throw (new Error('undefined url template: ' + id));
	}

	public getURL(id: string, vars?: any): string {
		if (vars) {
			var obj = Object.create(this._vars);
			Object.keys(vars).forEach((id) => {
				if (typeOf.isValid(vars[id])) {
					obj[id] = vars[id];
				}
			});
			return this.getTemplate(id).fillFromObject(obj);
		}
		return this.getTemplate(id).fillFromObject(this._vars);
	}
}

export = URLManager;
