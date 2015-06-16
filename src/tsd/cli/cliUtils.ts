/// <reference path="../_ref.d.ts" />

'use strict';

import tty = require('tty');

export function getViewWidth(width: number = 80, max: number = 0): number {
	var isatty = (tty.isatty(1) && tty.isatty(2));
	if (isatty) {
		if (typeof process.stdout['getWindowSize'] === 'function') {
			width = process.stdout['getWindowSize'](1)[0];
		}
		else {
			width = tty['getWindowSize']()[1];
		}
	}
	if (max > 0) {
		width = Math.min(max, width);
	}
	return width;
}
