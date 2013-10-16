///<reference path="../../typings/node/node.d.ts" />
///<reference path="../xm/typeOf.ts" />
///<reference path="../xm/assertVar.ts" />


module git {
	'use strict';

	var crypto = require('crypto');

	export module GitUtil {

		export function decodeBlobJson(blobJSON:any):NodeBuffer {
			if (!blobJSON || !blobJSON.encoding) {
				return null;
			}
			switch (blobJSON.encoding) {
				case 'base64':
					return <NodeBuffer>new Buffer(blobJSON.content, 'base64');
				case 'utf-8':
				case 'utf8':
				default:
					return <NodeBuffer>new Buffer(blobJSON.content, 'utf8');
			}
		}

		export function blobShaHex(data:NodeBuffer, encoding?:string):string {
			xm.assertVar(data, Buffer, 'data');
			return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data, encoding).digest('hex');
		}
	}
}
