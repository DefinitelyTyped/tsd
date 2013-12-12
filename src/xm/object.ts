/*
 * imported from typescript-xm package
 *
 * Bart van der Schoor
 * https://github.com/Bartvds/typescript-xm
 * License: MIT - 2013
 * */

/// <reference path="_ref.d.ts" />
/// <reference path="typeOf.ts" />

module xm {
	'use strict';

	function deepFreezeRecursive(object:any, active:any[]):void {
		var value:any, prop:string;
		active = (active || []);
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

	export module object {
		//lazy alias for consistency
		export function hasOwnProp(obj:any, prop:string):boolean {
			return Object.prototype.hasOwnProperty.call(obj, prop);
		}

		export function defineProp(object:Object, property:string, settings:any):void {
			Object.defineProperty(object, property, settings);
		}

		export function defineProps(object:Object, propertyNames:string[], settings:any):void {
			propertyNames.forEach((property:string) => {
				xm.object.defineProp(object, property, settings);
			});
		}

		export function hidePrefixed(object:Object, ownOnly:boolean = true):void {
			for (var property in object) {
				if (property.charAt(0) === '_' && (!ownOnly || xm.object.hasOwnProp(object, property))) {
					xm.object.defineProp(object, property, {enumerable: false});
				}
			}
		}

		export function hideProps(object:Object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {enumerable: false});
			});
		}

		export function lockProps(object:Object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {writable: false});
			});
		}

		export function freezeProps(object:Object, props:string[]) {
			props.forEach((property:string) => {
				Object.defineProperty(object, property, {writable: false});
				Object.freeze(object[property]);
			});
		}

		export function lockPrimitives(object:Object):void {
			Object.keys(object).forEach((property:string) => {
				if (xm.isPrimitive(object[property])) {
					Object.defineProperty(object, property, {writable: false});
				}
			});
		}

		export function deepFreeze(object:Object):void {
			if (xm.isObject(object) || xm.isArray(object)) {
				deepFreezeRecursive(object, []);
			}
		}
	}
}
