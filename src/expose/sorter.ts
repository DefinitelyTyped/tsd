/// <reference path="../_ref.d.ts" />

'use strict';

import Command = require('./Command');
import Option = require('./Option');
import Group = require('./Group');

export function sortCommandIndex(one: Command, two: Command): number {
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

export function sortHasElem(one: any[], two: any[], elem: any): number {
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

export function sortCommand(one: Command, two: Command): number {
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

export function sortGroup(one: Group, two: Group): number {
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

export function sortOption(one: Option, two: Option): number {
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
