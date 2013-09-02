///<reference path="../xm/KeyValueMap.ts" />

module git {
	/*
	 getDecodedBlob: decoders for github blob-api
	*/
	var decoders = new xm.KeyValueMap({
		'base64': function (value:string):string {
			return new Buffer(value, 'base64').toString();
		},
		'utf-8': function (value:string):string {
			return new Buffer(value, 'utf8').toString();
		},
		'raw': function (value:any):string {
			return value;
		}
	});

	export function getDecodedBlob(blobJSON:any) {
		var encoding = 'raw';
		if (blobJSON.encoding && decoders.has(blobJSON.encoding)){
			encoding = blobJSON.encoding;
		}
		return decoders.get(encoding)(blobJSON.content);
	}
}