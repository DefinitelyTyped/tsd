/// <reference path="../_ref.d.ts" />

import type = require('../typeOf');
import Notification = require('./Notification');

function getNote(message: string, code?: any, data?: any): Notification {
	return {
		code: (type.isValid(code) ? String(code) : null),
		message: message,
		data: data
	};
}

export = getNote;
