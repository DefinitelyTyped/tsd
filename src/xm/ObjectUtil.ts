///<reference path="_ref.d.ts" />
///<reference path="typeOf.ts" />

module xm {
	'use strict';

	function deepFreezeRecursive(object, active:any[]) {
		var value, prop;
		active.push(object);
		Object.freeze(object);
		for (prop in object) {
			if (object.hasOwnProperty(prop)) {
				value = object[prop];
				if (xm.isObject(value) || xm.isArray(value)) {
					if (active.indexOf(object) < 0) {
						deepFreezeRecursive(value, active);
					}
				}
			}
		}
	}

	export class ObjectUtil {
		//lazy alias for consistency
		static hasOwnProp(obj:any, prop:string):boolean {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		}

		static defineProp(object:Object, property:string, settings:any):void {
			Object.defineProperty(object, property, settings);
		}

		static defineProps(object:Object, propertyNames:string[], settings:any):void {
			propertyNames.forEach((property:string) => {
				ObjectUtil.defineProp(object, property, settings);
			});
		}

		static hidePrefixed(object:Object, ownOnly:boolean = true):void {
			for (var property in object) {
				if (property.charAt(0) === '_' && (!ownOnly || ObjectUtil.hasOwnProp(object, property))) {
					ObjectUtil.defineProp(object, property, {enumerable: false});
				}
			}
		}

		static hideProps(object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {enumerable: false});
			});
		}

		static lockProps(object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {writable: false});
			});
		}

		static freezeProps(object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {writable: false});
				Object.freeze(object[property]);
			});
		}

		static lockPrimitives(object) {
			Object.keys(object).forEach((property:string) => {
				if (xm.isPrimitive(object[property])) {
					Object.defineProperty(object, property, {writable: false});
				}
			});
		}

		static deepFreeze(object) {
			if (xm.isObject(object) || xm.isArray(object)) {
				deepFreezeRecursive(object, []);
			}
		}
	}
}
