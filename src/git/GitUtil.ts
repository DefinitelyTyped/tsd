/// <reference path="./_ref.d.ts" />

'use strict';

import assertVar = require('../xm/assertVar');
import crypto = require('crypto');

export function decodeBlobJson(blobJSON: any): NodeBuffer {
	if (!blobJSON || !blobJSON.encoding) {
		return null;
	}
	switch (blobJSON.encoding) {
		case 'base64':
			return new Buffer(blobJSON.content, 'base64');
		case 'utf-8':
		case 'utf8':
		default:
			return new Buffer(blobJSON.content, 'utf8');
	}
}

export function blobShaHex(data: NodeBuffer, encoding?: string): string {
	assertVar(data, Buffer, 'data');
	return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data, encoding).digest('hex');
}
