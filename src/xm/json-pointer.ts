/// <reference path="_ref.d.ts" />
/// <reference path="assertVar.ts" />

module xm {
	'use strict';

	var pointer:JSON_Pointer = require('json-pointer');

	export class JSONPointer {

		object:Object;

		constructor(object:Object) {
			xm.assertVar(object, 'object', 'object');
			this.object = object;
		}

		getValue(path:string, alt?:any):any {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			if (pointer.has(this.object, path)) {
				return pointer.get(this.object, path);
			}
			return alt;
		}

		setValue(path:string, value?:any):void {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			pointer.set(this.object, path, value);
		}

		getChild(path:string, alt:any = null):JSONPointer {
			var value = this.getValue(path);
			if (typeof value === 'object' && value) {
				return new JSONPointer(value);
			}
			return alt;
		}

		getNumber(path:string, alt:number = NaN):number {
			var value = this.getValue(path);
			if (typeof value === 'number') {
				return value;
			}
			return alt;
		}

		getBoolean(path:string, alt:boolean = false):boolean {
			return xm.isFlagOn(this.getValue(path, alt));
		}

		getString(path:string, alt:string = null):string {
			var value = this.getValue(path);
			if (typeof value === 'string') {
				return value;
			}
			else if (typeof value === 'number') {
				return String(value);
			}
			return alt;
		}

		getDate(path:string, alt:Date = null):Date {
			var value = this.getValue(path);
			if (typeof value === 'string') {
				return new Date(value);
			}
			return alt;
		}

		getDurationSecs(path:string, alt:number = 0):number {
			var value = this.getValue(path);
			if (typeof value === 'object') {
				var d = 0;
				if (typeof value.years !== 'undefined') {
					d += 31557600;
				}
				if (typeof value.months !== 'undefined') {
					d += 31557600 / 12;
				}
				if (typeof value.weeks !== 'undefined') {
					d += 7 * 24 * 3600;
				}
				if (typeof value.days !== 'undefined') {
					d += 24 * 3600;
				}
				if (typeof value.hours !== 'undefined') {
					d += 3600;
				}
				if (typeof value.minutes !== 'undefined') {
					d += 60;
				}
				if (typeof value.seconds !== 'undefined') {
					d += value.seconds;
				}
				return d;
			}
			return alt;
		}
	}
}
