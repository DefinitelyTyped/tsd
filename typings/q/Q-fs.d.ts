// Type definitions for Q-io filesystem
// Project: https://github.com/kriskowal/q-io
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface Qfs {
	open(path:string, options?:any):Qpromise;
	read(path:string, options?:any):Qpromise;
	write(path:string, content:any, options?:any):Qpromise;
	append(path:string, content:any, options?:any):Qpromise;
	copy(source:string, target:string):Qpromise;
	copyTree(source:string, target:string):Qpromise;
	list(path:string):Qpromise;
	listTree(path:string, guard?:(path:string, stat) => boolean):Qpromise;
	listDirectoryTree(path:string):Qpromise;

	makeDirectory(path:string, mode?:string):Qpromise;
	makeDirectory(path:string, mode?:number):Qpromise;
	makeTree(path:string, mode?:string):Qpromise;
	makeTree(path:string, mode?:number):Qpromise;

	remove(path:string):Qpromise;
	removeTree(path:string):Qpromise;
	rename(source:string, target:string):Qpromise;
	move(source:string, target:string):Qpromise;
	link(source:string, taget):Qpromise;
	symbolicCopy(source:string, target:string, type):Qpromise;
	symbolicLink(target:string, link, type):Qpromise;
	chown(path:string, uid, gid):Qpromise;

	chmod(path:string, mode?:string):Qpromise;
	chmod(path:string, mode?:number):Qpromise;

	stat(path:string):Qpromise;
	statLink(path:string):Qpromise;
	statFd(fd):Qpromise;
	exists(path:string):Qpromise;
	isFile(path:string):Qpromise;
	isDirectory(path:string):Qpromise;
	isSymbolicLink(path:string):Qpromise;
	lastModified(path:string):Qpromise;
	lastAccessed(path:string):Qpromise;
	split(path:string):Qpromise;
	join(...path:string[]):Qpromise;
	resolve(...path:string[]):Qpromise;
	normal(...path:string[]):Qpromise;
	absolute(path:string):Qpromise;
	canonical(path:string):Qpromise;
	readLink(path:string):Qpromise;
	contains(parent:string, child:string):Qpromise;
	relative(source:string, target:string):Qpromise;
	relativeFromFile(source:string, target:string):Qpromise;
	relativeFromDirectory(source:string, target:string):Qpromise;
	isAbsolute(path:string):Qpromise;
	isRelative(path:string):Qpromise;
	isRoot(path:string):Qpromise;
	root(path:string):Qpromise;
	directory(path:string):Qpromise;
	base(path:string, extension):Qpromise;
	extension(path:string):Qpromise;
	reroot(path:string):Qpromise;
	toObject(path:string):Qpromise;
	glob(pattern):Qpromise;
	match(pattern, path:string):Qpromise;
}