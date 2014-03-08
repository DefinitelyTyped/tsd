/// <reference path="_ref.d.ts" />
/// <reference path="assertVar.ts" />

module xm {
	'use strict';

	var pointer:JSON_Pointer = require('json-pointer');

	export class JSONPointer {

		// keep a stack of objects
		objects:Object[];
		prefix:string = '';

		constructor(object?:Object, prefix:string = '') {
			this.objects = object ? [object] : [];
			if (prefix && !/^\//.test(prefix)) {
				prefix = '/' + prefix;
			}
			this.prefix = prefix;
		}

		hasValue(path:string):boolean {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			path = this.prefix + path;
			for (var i = 0, ii = this.objects.length; i < ii; i++) {
				if (pointer.has(this.objects[i], path)) {
					return true;
				}
			}
			return false;
		}

		getValue(path:string, alt:any = null):any {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			path = this.prefix + path;
			for (var i = 0, ii = this.objects.length; i < ii; i++) {
				var obj = this.objects[i];
				if (pointer.has(obj, path)) {
					return pointer.get(obj, path);
				}
			}
			return alt;
		}

		addSource(object:Object):any {
			this.objects.unshift(object);
		}

		setValue(path:string, value?:any):void {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			path = this.prefix + path;
			pointer.set(this.objects[0], path, value);
		}

		getChild(path:string, alt:any = null):JSONPointer {
			if (!/^\//.test(path)) {
				path = '/' + path;
			}
			if (this.hasValue(path)) {
				var p = new JSONPointer();
				p.objects = this.objects.slice(0);
				p.prefix = this.prefix + path;
				return p;
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
			if (typeof value === 'string' || typeof value === 'number') {
				return new Date(value);
			}
			return alt;
		}
		// TODO fix crude timing calc
		getDurationSecs(path:string, alt:number = 0):number {
			var value = this.getValue(path);
			if (typeof value === 'object') {
				var d = 0;
				if (typeof value.years === 'number') {
					d += value.years * 31557600;
				}
				if (typeof value.months === 'number') {
					d += value.months * 31557600 / 12;
				}
				if (typeof value.weeks === 'number') {
					d += value.weeks * 7 * 24 * 3600;
				}
				if (typeof value.days === 'number') {
					d += value.days * 24 * 3600;
				}
				if (typeof value.hours === 'number') {
					d += value.hours * 3600;
				}
				if (typeof value.minutes === 'number') {
					d += value.minutes * 60;
				}
				if (typeof value.seconds === 'number') {
					d += value.seconds;
				}
				return d;
			}
			return alt;
		}
	}
}
