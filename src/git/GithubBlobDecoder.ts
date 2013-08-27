
module git {

	var decoders = {
		'base64': function (value:string):string {
			return new Buffer(value, 'base64').toString();
		},
		'utf-8': function (value:string):string {
			return new Buffer(value, 'utf8').toString();
		},
		'raw': function (value:string):string {
			return value;
		}
	};

	export function getDecodedBlob(blobJSON:any) {
		var encoding = 'raw';
		if (!blobJSON.encoding && decoders.hasOwnProperty(blobJSON.encoding)){
			encoding = blobJSON.encoding;
		}
		return decoders[encoding](blobJSON.content);
	}
}