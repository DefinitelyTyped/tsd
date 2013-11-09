module git {
	'use strict';

	var subjectExp = /^(.*?)[ \t]*(?:[\r\n]+|$)/;

	/*
	 GitCommitMessage: parse git commit message (for subject/body/footer convention etc)
	 */
	export class GitCommitMessage {
		//full test
		text:string;

		//extracted for text
		subject:string;
		body:string;
		footer:string;

		constructor(text:string = null) {
			if (text) {
				this.parse(this.text);
			}
		}

		parse(text:string):void {
			this.text = String(text);

			subjectExp.lastIndex = 0;
			var match = subjectExp.exec(this.text);
			this.subject = (match && match.length > 1 ? match[1] : '');
			this.body = '';
			this.footer = '';
			//TODO extract body and footer too
		}

		toString():string {
			return (typeof this.subject === 'string' ? this.subject : '<no subject>');
		}
	}
}
