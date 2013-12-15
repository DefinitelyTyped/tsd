// Type definitions for Lazy.js 0.2.1
// Project: https://github.com/dtao/lazy.js/
// Definitions by: Bart van der Schoor <https://github.com/Bartvds>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

interface Lazy {
	(value:any):Lazy.Sequence;

	generate():Lazy.GeneratedSequence;
	range():Lazy.GeneratedSequence;
	repeat():Lazy.GeneratedSequence;
}

declare module Lazy {

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	interface Callback {
		():void;
	}

	interface ErrorCallback {
		(error:any):void;
	}

	interface ValueCallback {
		(value:any):void;
	}

	interface GetKeyCallback {
		(value:any):string;
	}

	interface TestCallback {
		(value:any):boolean;
	}

	interface MapCallback {
		(value:any):any;
	}

	interface MapStringCallback {
		(value:string):string;
	}

	interface NumberCallback {
		(value:any):number;
	}

	interface MemoCallback {
		(memo:any, value:any):any;
	}

	interface GeneratorCallback {
		(index:number):any;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	interface Iterator {
		new(sequence:Sequence):Iterator;
		current():any;
		moveNext():boolean;
	}

	interface GeneratedSequence extends Sequence {
		new(generatorFn:GeneratorCallback, length:number):GeneratedSequence;
		each(callback:ValueCallback):void;
		length():number;
	}

	interface AsyncSequence extends Sequence {
		each(callback:ValueCallback):AsyncHandle;
	}

	interface AsyncHandle {
		cancel():void;
		onComplete(callback:Callback):void;
		onError(callback:ErrorCallback):void;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	module Sequence {
		function define(methodName:string[], overrides:Object):Function;
	}

	interface Sequence {
		// TODO improve define() (needs ugly overload)
		async(interval:number):AsyncSequence;
		compact():Sequence;
		concat(var_args:any[]):Sequence;
		consecutive(length:number):Sequence;
		contains(value:any):boolean;
		countBy(propertyName:string):Sequence;
		countBy(keyFn:GetKeyCallback):Sequence;
		dropWhile(predicateFn:TestCallback):Sequence;
		each(eachFn:ValueCallback):Sequence;
		every(predicateFn:TestCallback):boolean;
		filter(predicateFn:TestCallback):Sequence;
		find(predicateFn:TestCallback):Sequence;
		findWhere(properties:Object):Sequence;

		first():any;
		first(count:number):Sequence;

		flatten():Sequence;
		groupBy(keyFn:GetKeyCallback):ObjectLikeSequence;
		indexOf(value:any):Sequence;
		initial(count?:number):Sequence;
		intersection(var_args:any[]):Sequence;
		invoke(methodName:string):Sequence;
		isEmpty():boolean;
		join(delimiter?:string):string;

		last():any;
		last(count:number):Sequence;

		lastIndexOf(value:any):Sequence;
		map(mapFn:MapCallback):Sequence;
		max(valueFn?:NumberCallback):any;
		min(valueFn?:NumberCallback):any;
		pluck(propertyName:string):Sequence;
		reduce(aggregatorFn:MemoCallback, memo?:any):any;
		reduceRight(aggregatorFn:MemoCallback, memo:any):any;
		reject(predicateFn:TestCallback):Sequence;
		rest(count?:number):Sequence;
		reverse():Sequence;
		shuffle():Sequence;
		some(predicateFn?:TestCallback):boolean;
		sortBy(sortFn:NumberCallback):Sequence;
		sortedIndex(value:any):Sequence;
		sum(valueFn?:NumberCallback):Sequence;
		takeWhile(predicateFn:TestCallback):Sequence;
		union(var_args:any[]):Sequence;
		uniq():Sequence;
		where(properties:Object):Sequence;
		without(var_args:any[]):Sequence;
		zip(var_args:any[]):Sequence;

		toArray():any[];
		getIterator():Iterator;
		toObject():Object;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	module ArrayLikeSequence {
		function define(methodName:string[], overrides:Object):Function;
	}

	interface ArrayLikeSequence extends Sequence {
		// define()X;
		concat():ArrayLikeSequence;
		first(count?:number):ArrayLikeSequence;
		get(index:number):any;
		length():number;
		map(mapFn:MapCallback):ArrayLikeSequence;
		pop():ArrayLikeSequence;
		rest(count?:number):ArrayLikeSequence;
		reverse():ArrayLikeSequence;
		shift():ArrayLikeSequence;
		slice(begin:number, end?:number):ArrayLikeSequence;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	module ObjectLikeSequence {
		function define(methodName:string[], overrides:Object):Function;
	}

	interface ObjectLikeSequence extends Sequence {
		assign(other:Object):ObjectLikeSequence;
		// throws error
		//async():X;
		defaults(defaults:Object):ObjectLikeSequence;
		functions():Sequence;
		get(property:string):ObjectLikeSequence;
		invert():ObjectLikeSequence;
		keys():Sequence;
		omit(properties:string[]):ObjectLikeSequence;
		pairs():Sequence;
		pick(properties:string[]):ObjectLikeSequence;
		toArray():any[];
		toObject():Object;
		values():Sequence;
	}

	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

	module StringLikeSequence {
		function define(methodName:string[], overrides:Object):Function;
	}

	interface StringLikeSequence {
		charAt(index:number):string;
		charCodeAt(index:number):number;
		contains(value:string):boolean;
		endsWith(suffix:string):boolean;

		first():string;
		first(count:number):StringLikeSequence;

		indexOf(substring:string, startIndex?:number):number;

		last():string;
		last(count:number):StringLikeSequence;

		lastIndexOf(substring:string, startIndex?:number):number;
		mapString(mapFn:MapStringCallback):StringLikeSequence;
		match(pattern:RegExp):StringLikeSequence;
		reverse(): StringLikeSequence;

		split(delimiter:string):Sequence;
		split(delimiter:RegExp):Sequence;

		startsWith(prefix:string):boolean;
		substring(start:number, stop?:number):StringLikeSequence;
		toLowerCase():StringLikeSequence;
		toUpperCase():StringLikeSequence;
	}
}

declare module "lazy.js" {
	exports = Lazy;
}
