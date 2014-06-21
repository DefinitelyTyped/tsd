/// <reference path="./_ref.d.ts" />

'use strict';

export function padLeftZero(input: number, length: number = 2): string {
	var r = String(input);
	while (r.length < length) {
		r = '0' + r;
	}
	return r;
}

// lame word wrapper
export function wordWrap(input: string, length: number = 80): string[] {
	var lines = [];
	var broken = input.split(/\r?\n/);

	broken.forEach((line, index) => {
		var parts = line.trim().split(/[ \t]+/g);
		var accumulator: string[] = [];
		var len: number = 0;

		var next = parts.shift();
		accumulator.push(next);
		len += next.length + 1;

		while (parts.length > 0) {
			next = parts.shift();
			if (len + next.length + 1 > length) {
				lines.push(accumulator.join(' '));
				accumulator = [];
				len = 0;
			}
			accumulator.push(next);
			len += next.length + 1;
		}

		if (accumulator.length > 0) {
			lines.push(accumulator.join(' '));
		}
	});

	return lines;
}

