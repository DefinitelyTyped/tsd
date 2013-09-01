module git {

	var subjectExp = /^(.*?)[ \t]*(?:[\r\n]+|$)/;

	export class GitCommitMessage {
		text:string;

		//products
		subject:string;
		body:string;
		footer:string;

		constructor(text?:string) {
			this.parse(this.text);
		}

		parse(text?:string):void {
			this.text = String(text);

			subjectExp.lastIndex = 0;
			var match = subjectExp.exec(this.text);
			this.subject = (match && match.length > 1 ? match[1] : '');
			//TODO parse body and footer too
		}

		toString():string {
			return (typeof this.subject === 'string' ? this.subject : '<no subject>');
		}
	}
}