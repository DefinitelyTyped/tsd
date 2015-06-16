/// <reference path="../../xm/_ref.d.ts" />

'use strict';

import header = require('definition-header');

var trim = /\/$/;

/*
 AuthorInfo: basic info
 */
class AuthorInfo implements header.model.Person {

	constructor(public name: string = '', public url: string = null, public email: string = null) {
		if (this.url) {
			this.url = this.url.replace(trim, '');
		}
	}

	toString(): string {
		return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
	}

	toJSON(): any {
		var obj: any = {
			name: this.name
		};
		if (this.url) {
			obj.url = this.url;
		}
		if (this.email) {
			obj.email = this.email;
		}
		return obj;
	}
}

export = AuthorInfo;
