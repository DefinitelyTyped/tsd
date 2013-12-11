interface ReadOnlyBuffer {
	toString(encoding?:string, start?:number, end?:number): string;
	length: number;
	slice(start?:number, end?:number): NodeBuffer;
	readUInt8(offset:number, noAsset?:boolean): number;
	readUInt16LE(offset:number, noAssert?:boolean): number;
	readUInt16BE(offset:number, noAssert?:boolean): number;
	readUInt32LE(offset:number, noAssert?:boolean): number;
	readUInt32BE(offset:number, noAssert?:boolean): number;
	readInt8(offset:number, noAssert?:boolean): number;
	readInt16LE(offset:number, noAssert?:boolean): number;
	readInt16BE(offset:number, noAssert?:boolean): number;
	readInt32LE(offset:number, noAssert?:boolean): number;
	readInt32BE(offset:number, noAssert?:boolean): number;
	readFloatLE(offset:number, noAssert?:boolean): number;
	readFloatBE(offset:number, noAssert?:boolean): number;
	readDoubleLE(offset:number, noAssert?:boolean): number;
	readDoubleBE(offset:number, noAssert?:boolean): number;
}

interface NodeModule {
	exports: any;
	require(id:string): any;
	id: string;
	filename: string;
	loaded: boolean;
	parent: any;
	children: any[];
}

interface ArrayIterator<T> {
	next():ArrayIteratorTuple<T>;
}

interface ArrayIteratorTuple<T> {
	done:boolean;
	value:T;
}

interface Map<K, V> {
	keys(): ArrayIterator<K>;
	values():  ArrayIterator<V>;
}
