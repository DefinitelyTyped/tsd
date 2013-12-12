/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="../_ref.d.ts" />

module xm {
	'use strict';
	//TODO should probably be parseString?

	var jsesc = require('jsesc');

	export var parseStringMap:any = Object.create(null);

	var splitSV = /[\t ]*[,][\t ]*/g;

	parseStringMap.number = function (input:string) {
		var num = parseFloat(input);
		if (isNaN(num)) {
			throw new Error('input is NaN and not float');
		}
		return num;
	};
	parseStringMap.int = function (input:string) {
		var num = parseInt(input, 10);
		if (isNaN(num)) {
			throw new Error('input is NaN and not integer');
		}
		return num;
	};
	parseStringMap.string = function (input:string) {
		return String(input);
	};
	parseStringMap.boolean = function (input:string) {
		input = ('' + input).toLowerCase();
		if (input === '' || input === '0') {
			return false;
		}
		switch (input) {
			case 'false':
			case 'null':
			case 'nan':
			case 'undefined':
			//language
			case 'no':
			case 'off':
			case 'disabled':
				return false;
		}
		return true;
	};
	parseStringMap.flag = function (input:string) {
		if (xm.isUndefined(input) || input === '') {
			//empty flag is true
			return true;
		}
		return parseStringMap.boolean(input);
	};
	parseStringMap['number[]'] = function (input:string) {
		return input.split(splitSV).map((value) => {
			return parseStringMap.number(value);
		});
	};
	parseStringMap['int[]'] = function (input:string) {
		return input.split(splitSV).map((value) => {
			return parseStringMap.int(value);
		});
	};
	parseStringMap['string[]'] = function (input:string) {
		return input.split(splitSV);
	};
	parseStringMap.json = function (input:string) {
		return JSON.parse(input);
	};

	export function parseStringTo(input:string, type:string):any {
		if (xm.hasOwnProp(parseStringMap, type)) {
			return parseStringMap[type](input);
		}
		return input;
	}
}
