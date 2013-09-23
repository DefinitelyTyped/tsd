///<reference path="../../typings/DefinitelyTyped/node/node.d.ts" />
///<reference path="../xm/typeOf.ts" />


module git {
	'use strict';

	var crypto = require('crypto');

	export module GitUtil {
		/*
		 getDecodedBlob: decoders for github blob-api
		 */
		export function decodeBlob(blobJSON:any):NodeBuffer {
			switch (blobJSON.encoding) {
				case 'base64':
					return <NodeBuffer>new Buffer(blobJSON.content, 'base64');
				case 'utf-8':
				case 'utf8':
				default:
					return <NodeBuffer>new Buffer(blobJSON.content, 'utf8');
			}
		}

		export function blobSHAHex(data:NodeBuffer):string {
			return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
		}
	}
}
