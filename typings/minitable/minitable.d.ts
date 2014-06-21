/// <reference path="../ministyle/ministyle.d.ts" />
/// <reference path="../miniwrite/miniwrite.d.ts" />

// very much imperfect due to dynamic API (maybe add some generics?)

declare module 'minitable' {
	import ministyle = require('ministyle');
	import miniwrite = require('miniwrite');

	export function getBuilder(write: miniwrite.Line, style: ministyle.Style): Builder;

	interface Setup {
		name: string;
		halign?: string;
		padChar?: string;
		fillChar?: string;
	}

	interface Options {
		inner?: string;
		outer?: string;
		halign?: string;
		padChar?: string;
		fillChar?: string;
		rowSpace?: number;
	}

	interface RowType {
		row: any;
		init(): void;
		next(): void;
		close(): void;
	}

	interface Builder {
		createType(name: string, cols: Setup[], opts?: Options): RowType;
		closeAll(): void
		flush(): void;
	}
}
