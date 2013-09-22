///<reference path="../../typings/DefinitelyTyped/node/node.d.ts" />


module git {
	var crypto = require('crypto');

	var decoders = new xm.KeyValueMap({
		'base64': function (value:string):NodeBuffer {
			return <NodeBuffer>new Buffer(value, 'base64');
		},
		'utf-8': function (value:string):NodeBuffer {
			return <NodeBuffer>new Buffer(value, 'utf8');
		}
	});

	export module GitUtil {
		/*
		 getDecodedBlob: decoders for github blob-api
		 */
		export function decodeBlob(blobJSON:any):NodeBuffer {
			var encoding = 'utf-8';
			if (xm.isString(blobJSON.encoding) && decoders.has(blobJSON.encoding)) {
				encoding = blobJSON.encoding;
			}
			return decoders.get(encoding).call(null, blobJSON.content);
		}

		export function blobSHAHex(data:NodeBuffer):string {
			return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
		}
	}
}