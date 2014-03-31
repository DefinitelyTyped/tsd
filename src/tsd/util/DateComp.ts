/// <reference path="../_ref.d.ts" />

'use strict';

class DateComp {
	operator: string;
	comparator: (date1: Date, date2: Date) => boolean;
	date: Date;

	satisfies(date: Date): boolean {
		return this.comparator(date, this.date);
	}
}

export  = DateComp;
