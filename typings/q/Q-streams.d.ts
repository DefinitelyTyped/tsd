// Type definitions for Q-io streams
// Project: https://github.com/kriskowal/q-io
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../node/node.d.ts" />
///<reference path="Q.d.ts" />

interface QforEachCallback {
	(chunk:NodeBuffer):Qpromise;
	(chunk:string):Qpromise;
}
interface QforEach {
	forEach(callback:QforEachCallback):Qpromise;
}

interface Qreader extends QforEach {
	read():Qpromise;
	//what?
	close():void;
	node:NodeBuffer;
}
interface QbufferReader {
	new ():Qreader;
	read(stream:Qreader, charset:string):string;
	read(stream:Qreader):NodeBuffer;
	join(buffers:NodeBuffer[]):NodeBuffer;
}

interface Qwriter {
	write(content:string):void;
	write(content:NodeBuffer):void;
	flush():Qpromise;
	close():void;
	destroy():void;
	node:NodeBuffer;
}
interface QbufferWriter {
	(writer:NodeBuffer):Qwriter
}

interface Qstream extends Qreader, Qwriter {
}
interface QbufferStream {
	(buffer:NodeBuffer, encoding:string):Qstream
}
