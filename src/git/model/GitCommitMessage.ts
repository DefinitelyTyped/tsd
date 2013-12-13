module git {
	'use strict';

	//var subjectExp = /^(.*?)[ \t]*(?:[\r\n]+|$)/;

	var subjectMessageExp = /^\s*(\S.*?\S?)(?:\s*[\r\n]\s*([\s\S]*?))?\s*$/;
	//var cleanMultiLineExp = /(?:[ \t]*\r?\n[ \t]*){3,}/g;

	/*
	 GitCommitMessage: parse git commit message (for subject/body/footer convention etc)
	 */
	export class GitCommitMessage {
		//full test
		text:string;

		//extracted for text
		subject:string;
		body:string;

		constructor(text:string = null) {
			if (text) {
				this.parse(this.text);
			}
		}

		parse(text:string):void {
			this.text = String(text).replace(/(^\s+)|(\s+$)/g, '');
			this.subject = '';
			this.body = '';
			subjectMessageExp.lastIndex = 0;
			var match = subjectMessageExp.exec(this.text);
			if (match && match.length > 1) {
				this.subject = String(match[1]);
				if (match.length > 2 && typeof match[2] === 'string' && match[2] !== '') {
					this.body = match[2].replace(/\r\n/g, '\n');
				}
			}
		}

		toString():string {
			return (typeof this.subject === 'string' ? this.subject : '<no subject>');
		}
	}
}
