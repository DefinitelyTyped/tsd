
module tsd {

	var decoders = {
		'base64': function (value:string):string {
			return new Buffer(value, 'base64').toString();
		},
		'utf-8': function (value:string):string {
			return new Buffer(value, 'utf8').toString();
		},
		'plain': function (value:string):string {
			return String(value);
		}
	};

	export function getDecodedBlob(blobJSON:any) {
		var encoding = 'plain';
		if (!blobJSON.encoding && decoders.hasOwnProperty(blobJSON.encoding)){
			encoding = blobJSON.encoding;
		}
		return decoders[encoding](blobJSON.content);
	}
}