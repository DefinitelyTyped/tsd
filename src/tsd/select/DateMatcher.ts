/// <reference path="../_ref.d.ts" />

import typeOf = require('../../xm/typeOf');
import assert = require('../../xm/assert');
import assertVar = require('../../xm/assertVar');
import dateUtils = require('../../xm/dateUtils');

import DateComp = require('../util/DateComp');
import defUtil = require('../util/defUtil');

import DefVersion = require('../data/DefVersion');

var termExp = /(>=?|<=?|==) *(\d+[\d:;_ \-]+\d)/g;

var comparators = {
	'<=': function lte(date1: Date, date2: Date) {
		return dateUtils.isBeforeDate(date1, date2) || dateUtils.isEqualDate(date1, date2);
	},
	'<': dateUtils.isBeforeDate,
	'>=': function gte(date1: Date, date2: Date) {
		return dateUtils.isAfterDate(date1, date2) || dateUtils.isEqualDate(date1, date2);
	},
	'>': dateUtils.isAfterDate,
	'==': dateUtils.isEqualDate
};

/*
 DateMatcher
 */
class DateMatcher {

	comparators: DateComp[] = [];

	constructor(pattern?: string) {
		if (pattern) {
			this.extractSelector(pattern);
		}
	}

	filter(list: DefVersion[]): DefVersion[] {
		if (this.comparators.length === 0) {
			return list;
		}
		return list.filter(this.getFilterFunc());
	}

	best(list: DefVersion[]): DefVersion {
		return this.latest(this.filter(list));
	}

	latest(list: DefVersion[]): DefVersion {
		if (this.comparators.length > 0) {
			var list = this.filter(list).sort(defUtil.fileCommitCompare);
			if (list.length > 0) {
				return list[list.length - 1];
			}
		}
		return null;
	}

	extractSelector(pattern: string) {
		assertVar(pattern, 'string', 'pattern');
		this.comparators = [];
		if (!pattern) {
			return;
		}
		// this.beforeDate = beforeDate;
		// this.afterDate = afterDate;
		termExp.lastIndex = 0;
		var match: RegExpExecArray;
		while ((match = termExp.exec(pattern))) {
			termExp.lastIndex = match.index + match[0].length;
			assert(typeOf.hasOwnProp(comparators, match[1]), 'not a valid date comparator in filter {a}', match[0]);

			var comp = new DateComp();
			// cleanup
			comp.date = new Date(match[2].replace(/;_/g, ' '));
			assert(!!comp.date, 'not a valid date in filter {a}', match[0]);
			comp.operator = match[1];
			comp.comparator = comparators[match[1]];
			this.comparators.push(comp);
		}
	}

	private getFilterFunc(): (file: DefVersion) => boolean {
		var len = this.comparators.length;
		return (file: DefVersion) => {
			var date: Date = file.commit.changeDate;
			if (!date) {
				// wyrd
				return false;
			}
			for (var i = 0; i < len; i++) {
				if (!this.comparators[i].satisfies(date)) {
					return false;
				}
			}
			return true;
		};
	}
}

export = DateMatcher;
