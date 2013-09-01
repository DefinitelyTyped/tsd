module xm {

	var endSlashTrim = /\/?$/;

	export class AuthorInfo {

		constructor(public name:string = '', public url:string = undefined, public email:string = undefined) {
			if (this.url) {
				this.url = this.url.replace(endSlashTrim, '');
			}
		}

		toString():string {
			return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
		}

		toJSON():any {
			var obj:any = {name: this.name};
			if (this.url) {
				obj.url = this.url;
			}
			if (this.email) {
				obj.email = this.email;
			}
			return obj;
		}
	}
}