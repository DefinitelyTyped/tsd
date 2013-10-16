/*
 styler lifted from my own mocha-unfunk-reporter
 https://github.com/Bartvds/mocha-unfunk-reporter/
 MIT
 */
module xm {

	//TODO look into unifing this based on streams (so similar..)
	export module writer {

		var lineBreak = /\r?\n/;
		//TODO decide if line-based flushing should be enforced
		export interface TextWriter {
			start();
			//append (parse for line ends)
			write(str:string);
			//append and end line
			writeln(str?:string);
			finalise();
		}

		//TODO reimplement LineWriter (use a proper stream?)
		//TODO implement indenting in linewriter
		//TODO implement word wrapping in linewriter
		export class LineWriter implements TextWriter {

			textBuffer:string = '';


			start() {
				this.textBuffer = '';
			}

			finalise() {
				this.flushLineBuffer();
			}

			write(str:string) {
				//fast path
				if (str === '') {
					return;
				}
				this.textBuffer += str;

				//TODO replace ugly split with more optimal parser (while + lastIndex)
				var arr = this.textBuffer.split(lineBreak);
				var len = arr.length;
				if (len > 0) {
					for (var i = 0; i < len - 1; i++) {
						this.flushLine(arr[i]);
					}
					this.textBuffer = arr[len - 1];
				}
			}

			writeln(str?:string) {
				//fast path
				if (arguments.length === 0 || (this.textBuffer === '' && str === '')) {
					this.flushLine('');
					return;
				}
				this.textBuffer += str;

				//TODO replace ugly split with more optimal parser (while + lastIndex)
				var arr = this.textBuffer.split(lineBreak);
				var len = arr.length;
				if (len > 0) {
					for (var i = 0; i < len; i++) {
						this.flushLine(arr[i]);
					}
					this.textBuffer = '';
				}
			}

			flushLine(str:string) {
				//abstract noop
			}

			flushLineBuffer() {
				if (this.textBuffer.length > 0) {
					//TODO replace ugly split with more optimal parser (while + lastIndex)
					var arr = this.textBuffer.split(lineBreak);
					var len = arr.length;
					if (len > 0) {
						for (var i = 0; i < len; i++) {
							this.flushLine(arr[i]);
						}
						this.textBuffer = '';
					}
				}
			}
		}

		//flush each line as seperate log()
		export class ConsoleLineWriter extends LineWriter {

			flushLine(str:string) {
				console.log(str);
			}
		}

		//keep everything as one single chunky log();
		export class BufferWriter implements TextWriter {

			buffer:string;

			seperator:string;

			constructor(seperator?:string) {
				if (typeof seperator !== 'string') {
					this.seperator = '\n';
				}
				else {
					this.seperator = seperator;
				}
			}

			start() {
				this.buffer = '';
			}

			write(str:string) {
				if (str) {
					this.buffer += str;
				}
			}

			writeln(str?:string) {
				if (arguments.length > 0 && str.length > 0) {
					this.buffer += str + this.seperator;
				}
				else {
					this.buffer += this.seperator;
				}
			}

			finalise() {
				//keep buffer
			}
		}

		export class ConsoleBufferWriter extends BufferWriter {

			finalise() {
				if (this.buffer.length > 0) {
					console.log(this.buffer);
				}
				this.buffer = '';
			}
		}

		export class WritableStreamWriter extends LineWriter {

			constructor(public stream:WritableStream) {
				super();
			}

			start() {
			}

			finalise() {
			}

			flushLine(str:string) {
				if (str.length > 0) {
					this.stream.write(str + '\n', 'utf8');
				}
			}
		}

		export class NullWriter implements TextWriter {

			start() {
			}

			finalise() {
			}

			write(str:string) {
			}

			writeln(str?:string) {
			}
		}
	}
}
