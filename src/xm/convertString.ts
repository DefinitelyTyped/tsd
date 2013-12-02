/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

///<reference path="../_ref.d.ts" />
module xm {
	'use strict';

	var jsesc = require('jsesc');

	export var converStringMap:any = Object.create(null);

	var splitSV = /[\t ]*[,][\t ]*/g;

	converStringMap.number = function (input:string) {
		var num = parseFloat(input);
		if (isNaN(num)) {
			throw new Error('input is NaN and not float');
		}
		return num;
	};
	converStringMap.int = function (input:string) {
		var num = parseInt(input, 10);
		if (isNaN(num)) {
			throw new Error('input is NaN and not integer');
		}
		return num;
	};
	converStringMap.string = function (input:string) {
		return String(input);
	};
	converStringMap.boolean = function (input:string) {
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
	converStringMap.flag = function (input:string) {
		if (xm.isUndefined(input) || input === '') {
			//empty flag is true
			return true;
		}
		return converStringMap.boolean(input);
	};
	converStringMap['number[]'] = function (input:string) {
		return input.split(splitSV).map((value) => {
			return converStringMap.number(value);
		});
	};
	converStringMap['int[]'] = function (input:string) {
		return input.split(splitSV).map((value) => {
			return converStringMap.int(value);
		});
	};
	converStringMap['string[]'] = function (input:string) {
		return input.split(splitSV);
	};
	converStringMap.json = function (input:string) {
		return JSON.parse(input);
	};

	export function convertStringTo(input:string, type:string):any {
		if (xm.hasOwnProp(converStringMap, type)) {
			return converStringMap[type](input);
		}
		return input;
	}
}
