/// <reference path="../_ref.d.ts" />

import ExposeCommand = require('./ExposeCommand');
import ExposeOption = require('./ExposeOption');
import ExposeGroup = require('./ExposeGroup');

export function exposeSortIndex(one: ExposeCommand, two: ExposeCommand): number {
	if (one.index < two.index) {
		return -1;
	}
	else if (one.index > two.index) {
		return 1;
	}
	if (one.name < two.name) {
		return -1;
	}
	else if (one.name > two.name) {
		return 1;
	}
	return 0;
}

export function exposeSortHasElem(one: any[], two: any[], elem: any): number {
	var oneI = one.indexOf(elem) > -1;
	var twoI = two.indexOf(elem) > -1;
	if (oneI && !twoI) {
		return -1;
	}
	else if (!oneI && twoI) {
		return 1;
	}
	return 0;
}

export function exposeSortId(one: ExposeCommand, two: ExposeCommand): number {
	if (one.name < two.name) {
		return -1;
	}
	else if (one.name > two.name) {
		return 1;
	}
	if (one.index < two.index) {
		return -1;
	}
	else if (one.index > two.index) {
		return 1;
	}
	return 0;
}

export function exposeSortGroup(one: ExposeGroup, two: ExposeGroup): number {
	if (one.index < two.index) {
		return -1;
	}
	else if (one.index > two.index) {
		return 1;
	}
	if (one.name < two.name) {
		return -1;
	}
	else if (one.name > two.name) {
		return 1;
	}
	return 0;
}

export function exposeSortOption(one: ExposeOption, two: ExposeOption): number {
	if (one.short && !two.short) {
		return -1;
	}
	if (!one.short && two.short) {
		return 1;
	}
	if (one.short && two.short) {
		if (one.short.toLowerCase() < two.short.toLowerCase()) {
			return -1;
		}
		else if (one.short.toLowerCase() > two.short.toLowerCase()) {
			return 1;
		}
	}
	if (one.name.toLowerCase() < two.name.toLowerCase()) {
		return -1;
	}
	else if (one.name.toLowerCase() > two.name.toLowerCase()) {
		return 1;
	}
	return 0;
}
