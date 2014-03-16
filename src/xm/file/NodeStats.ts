/// <reference path="../_ref.d.ts" />

interface NodeStats {
	isFile():boolean;
	isDirectory():boolean;
	isBlockDevice():boolean;
	isCharacterDevice():boolean;
	isSymbolicLink():boolean;
	isFIFO():boolean;
	isSocket():boolean;
	dev:number;
	ino:number;
	mode:number;
	nlink:number;
	uid:number;
	gid:number;
	rdev:number;
	size:number;
	blksize:number;
	blocks:number;
	atime:Date;
	mtime:Date;
	ctime:Date;
}

export = NodeStats;
