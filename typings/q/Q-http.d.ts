// Type definitions for Q-io http
// Project: https://github.com/kriskowal/q-io
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="Q.d.ts" />
///<reference path="Q-streams.d.ts" />
///<reference path="../node/node.d.ts" />

interface Qhttp {
	request(request:Qrequest):Qpromise;
	request(url:string):Qpromise;

	read(request:Qrequest):Qpromise;
	read(url:string):Qpromise;

	normalizeRequest(request:Qrequest):Qrequest;
	normalizeRequest(url:string):Qrequest;

	normalizeResponse(response:Qresponse):Qresponse;
}
interface Qrequest {
	url:string;
	path:string;
	scriptName:string;
	pathInfo:string;
	version:string[];
	method:string;
	scheme:string;

	host:string;
	port:number;
	remoteHost:string;
	remotePort:number;

	headers:Qheaders;
	agent:any;
	body:any;
	node:any;
}
interface Qresponse {
	status:number;
	headers:Qheaders;
	body:Qreader
	onclose:() => void;
	node:any;
}
interface Qheaders {
	[name:string]:string;
	[name:string]:string[];
}
interface Qbody extends Qstream {

}
interface Qapplication {
	(req:Qrequest):Qpromise;
}
